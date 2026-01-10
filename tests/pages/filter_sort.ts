import { Page, Locator, expect, test } from "@playwright/test";

export class SearchResultsPage {
  private page: Page;
  private main: Locator;

  private acceptAllCookiesBtn: Locator;

  private expansionSelect: Locator;
  private sortSelect: Locator;
  private searchBtn: Locator;

  private firstRow: Locator;
  private firstPrice: Locator;
  private allPrices: Locator;

  // marqueur de liste
  private firstResultLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator("main");

    this.acceptAllCookiesBtn = page.getByRole("button", { name: /accept all cookies/i });

    this.expansionSelect = this.main.getByRole("combobox", { name: /^expansion$/i });
    this.sortSelect = this.main.getByRole("combobox", { name: /^sort by$/i });
    this.searchBtn = this.main.getByRole("button", { name: /^search$/i });

    // résultats
    this.firstRow = this.main.locator('[class*="row"]').filter({ hasText: "€" }).first();
    this.firstPrice = this.firstRow.locator('text=/\\d+(?:[.,]\\d+)?\\s*€/').first();
    this.allPrices = this.main.locator('text=/\\d+(?:[.,]\\d+)?\\s*€/' );

    this.firstResultLink = this.main.locator('a[href*="/Products/"]').first();
  }


  // Anti-bot / human verification
  
  private async skipIfHumanVerification(): Promise<void> {
    const body = this.page.locator("body");
    const txt = await body.innerText().catch(() => "");

    const signals = [
      /verify you are human/i,
      /human verification/i,
      /captcha/i,
      /cloudflare/i,
      /needs to review the security/i,
      /ray id/i,
    ];

    if (signals.some((re) => re.test(txt))) {
      test.skip(true, "Cardmarket a déclenché une vérification humaine (Cloudflare).");
    }
  }

  async acceptCookiesIfPresent(): Promise<void> {
    if (await this.acceptAllCookiesBtn.isVisible().catch(() => false)) {
      await this.acceptAllCookiesBtn.click();
    }
  }

  async waitForResultsLoaded(): Promise<void> {
    await this.skipIfHumanVerification();

    await expect(this.page.getByRole("heading", { name: /search results/i })).toBeVisible({ timeout: 20000 });
    await expect(this.main).toBeVisible({ timeout: 20000 });

    await expect(this.firstRow).toBeVisible({ timeout: 20000 });
    await expect(this.firstPrice).toBeVisible({ timeout: 20000 });
  }

  private async getMarker(): Promise<{ href: string; price: string }> {
    await this.waitForResultsLoaded();
    const href = (await this.firstResultLink.getAttribute("href").catch(() => "")) ?? "";
    const price = (await this.firstPrice.innerText().catch(() => "")).trim();
    return { href: href.trim(), price };
  }

  private async submitAndWaitForUpdate(before?: { href: string; price: string }): Promise<void> {
    const prev = before ?? (await this.getMarker());

    await Promise.all([
      this.page.waitForLoadState("domcontentloaded").catch(() => {}),
      this.searchBtn.click(),
    ]);

    await this.skipIfHumanVerification();
    await this.waitForResultsLoaded();

    // on attend un changement observable (href OU prix)
    await expect
      .poll(async () => {
        const now = await this.getMarker().catch(() => prev);
        return now.href !== prev.href || now.price !== prev.price;
      }, { timeout: 20000 })
      .toBeTruthy()
      .catch(async () => {
        // fallback: si résultat identique, on garantit juste l'état stable
        await this.waitForResultsLoaded();
      });
  }

  // ------- Expansion (si tu l'utilises dans le spec) -------
  async expectExpansionSelected(value: string): Promise<void> {
    await this.waitForResultsLoaded();
    await expect(this.expansionSelect.locator("option:checked")).toHaveText(
      new RegExp(`^${escapeRegex(value)}$`, "i"),
      { timeout: 20000 }
    );
  }

  async applyExpansion(value: string): Promise<void> {
    await this.waitForResultsLoaded();

    const currentLabel = (await this.expansionSelect.locator("option:checked").innerText().catch(() => "")).trim();
    if (norm(currentLabel) === norm(value)) return;

    const before = await this.getMarker();

    await this.expansionSelect.selectOption({ label: value });
    await expect(this.expansionSelect.locator("option:checked")).toHaveText(
      new RegExp(`^${escapeRegex(value)}$`, "i")
    );

    await this.submitAndWaitForUpdate(before);
    await this.expectExpansionSelected(value);
  }

  // ------- Sort -------
  async sortByAny(labels: string[]): Promise<void> {
    await this.waitForResultsLoaded();

    const valueToSelect = await this.sortSelect.evaluate((el, wanted) => {
      const select = el as HTMLSelectElement;
      const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
      const opts = Array.from(select.options);
      const match = opts.find((o) => wanted.some((w: string) => norm(o.textContent ?? "").includes(norm(w))));
      return match?.value ?? null;
    }, labels);

    if (!valueToSelect) {
      const available = await this.sortSelect.evaluate((el) => {
        const select = el as HTMLSelectElement;
        return Array.from(select.options).map((o) => o.textContent?.trim()).filter(Boolean);
      });
      throw new Error(`Option de tri introuvable. Labels: ${labels.join(", ")}. Options dispo: ${available.join(" | ")}`);
    }

    const currentValue = await this.sortSelect.inputValue();
    if (currentValue === valueToSelect) {
      await this.expectSortSelected(labels);
      return;
    }

    const before = await this.getMarker();

    await this.sortSelect.selectOption({ value: valueToSelect });
    await expect(this.sortSelect).toHaveValue(valueToSelect, { timeout: 20000 });

    
    await this.submitAndWaitForUpdate(before);

    await this.expectSortSelected(labels);
  }

  async expectSortSelected(labels: string[]): Promise<void> {
    await this.waitForResultsLoaded();
    const selectedText = (await this.sortSelect.locator("option:checked").innerText().catch(() => "")).trim().toLowerCase();
    const ok = labels.some((l) => selectedText.includes(l.trim().toLowerCase()));
    if (!ok) {
      throw new Error(`Tri non appliqué. Select affiche: "${selectedText}". Attendu: ${labels.join(" / ")}`);
    }
  }

  async expectPricesAscending(n: number): Promise<void> {
    await this.waitForResultsLoaded();

    const count = await this.allPrices.count();
    const take = Math.min(n, count);

    const prices: number[] = [];
    for (let i = 0; i < take; i++) {
      const raw = await this.allPrices.nth(i).innerText();
      const val = parseEuroPrice(raw);
      if (Number.isFinite(val)) prices.push(val);
    }

    if (prices.length < 2) throw new Error(`Pas assez de prix lisibles (${prices.length}).`);

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] < prices[i - 1]) {
        throw new Error(`Prix non triés: ${prices.join(" -> ")}`);
      }
    }
  }
}

// utils
function parseEuroPrice(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace("€", "").replace(",", "."));
}
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}
