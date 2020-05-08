import playwright, {
  ChromiumBrowser,
  BrowserContext,
  Page,
} from "playwright-chromium";

interface ProdDetail {
  title: string;
  owner: string;
  price: string;
}

export class Amazon {
  private crBrowser: ChromiumBrowser | null = null;
  private crContext: BrowserContext | null = null;
  private crPage: Page | null = null;
  private todaysDealUrl =
    "https://www.amazon.com/international-sales-offers/b/?ie=UTF8&node=15529609011&ref_=nav_cs_gb_intl";

  async initialize(): Promise<void> {
    console.log("Initializing...");
    this.crBrowser = await playwright.chromium.launch({ headless: false });
    this.crContext = await this.crBrowser.newContext();
    this.crPage = await this.crContext.newPage();
    console.log("Initialized sucefull");
  }

  async singleProdDetail(link: string): Promise<ProdDetail> {
    console.log("Goind to the Product page...");
    await this.crPage?.goto(link);
    const prodInfo = await this.crPage?.evaluate(
      (): ProdDetail => {
        const getInnerText = (selector: string): string | boolean => {
          return document.querySelector(selector)
            ? (document.querySelector(selector)?.textContent?.trim() as string)
            : false;
        };

        return {
          title: getInnerText("#productTitle") as string,
          owner: getInnerText("#bylineInfo") as string,
          price: getInnerText("#buyNew_noncbb, #price_inside_buybox") as string,
        };
      }
    );
    return prodInfo as ProdDetail;
  }

  async getTodaysDeal(): Promise<ProdDetail[]> {
    console.log("Getting todays deal...");
    await this.crPage?.goto(this.todaysDealUrl);
    const prodList = await this.getItemsFromTodayDeal();

    // Pagination
    const lastPage = await this.crPage?.$eval(
      'ul[class="a-pagination"] > li:nth-child(6)',
      (e) => e.textContent
    );
    console.log(lastPage);
    for (let i = 0; i < parseInt(lastPage as string) - 1; i++) {
      // NextPage
      console.log(`Moving to the page ${i + 1}...`);
      const nextPages = await this.crPage?.$$(
        'ul[class="a-pagination"] > li[class="a-normal"]'
      );
      if (i == 0) {
        if (nextPages) await nextPages[0].click();
      } else if (i == 1) {
        if (nextPages) await nextPages[1].click();
      } else {
        if (nextPages) await nextPages[2].click();
      }

      // Add the new items
      const newProds = await this.getItemsFromTodayDeal();
      prodList.push(...newProds);
    }
    // delete empty objs
    return prodList.filter((item) => Object.keys(item).length);
  }

  async end(): Promise<void> {
    console.log("Stopping the scraper...");
    await this.crBrowser?.close();
  }

  private async getItemsFromTodayDeal(): Promise<ProdDetail[]> {
    await this.crPage?.waitForLoadState("domcontentloaded");
    await this.crPage?.waitForTimeout(1200);
    const prods = await this.crPage?.evaluate((): ProdDetail[] => {
      return Array.from(
        document.querySelectorAll('div[id="widgetContent"] > div')
      ).map((ele) => {
        return {
          title: ele
            .querySelector('a > span[class="a-declarative"]')
            ?.textContent?.trim() as string,
          owner: ele
            .querySelector("#shipSoldInfo")
            ?.textContent?.trim() as string,
          price: ele
            .querySelector("div.a-row.priceBlock.unitLineHeight > span")
            ?.textContent?.trim() as string,
        };
      });
    });

    return prods as ProdDetail[];
  }
}
