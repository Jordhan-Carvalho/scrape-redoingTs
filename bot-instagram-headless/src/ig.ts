import playwright from "playwright-chromium";

export class Instagram {
  crBrowser: playwright.ChromiumBrowser | null = null;
  crContext: playwright.ChromiumBrowserContext | null = null;
  crPage: playwright.Page | null = null;
  url = "https://instagram.com";

  constructor() {}

  public async initialize(): Promise<void> {
    this.crBrowser = await playwright.chromium.launch({
      headless: false,
      // args: ["--proxy-server=35.233.5.198:3128"],
    });
    this.crContext = await this.crBrowser.newContext();
    this.crPage = await this.crContext.newPage();
  }

  public async login(username: string, password: string): Promise<void> {
    await this.crPage?.goto(this.url, {
      waitUntil: "networkidle",
    });
    await this.crPage?.waitForTimeout(1230);
    // Fill form
    await this.crPage?.type('input[name="username"]', username, {
      delay: 78,
    });
    await this.crPage?.type('input[name="password"]', password, {
      delay: 185,
    });
    await this.crPage?.waitForTimeout(750);

    // Click the login url button
    let loginButton = await this.crPage?.$$(
      `xpath=${'//div[contains(text(), "Log In")]'}`
    );
    if (loginButton) await loginButton[0].click();
    await this.crPage?.waitForTimeout(1000);
  }

  public async likeTags(tags: string[] = []): Promise<void> {
    for (const tag of tags) {
      // Go to the tag page
      await this.crPage?.waitForTimeout(1000);
      const tagUrl = `https://www.instagram.com/explore/tags/${tag}/`;
      await this.crPage?.goto(tagUrl);
      await this.crPage?.waitForTimeout(1000);
      // Save posts on the recent div
      const posts = await this.crPage?.$$(
        'article > div:nth-child(3) img[decoding="auto"]'
      );
      for (let i = 0; i < 3; i++) {
        // const post = posts[i];
        // click on the post
        //@ts-ignore
        await posts[i].click();
        // wait for the modal appear
        await this.crPage?.waitForSelector(
          'span[id="react-root"][aria-hidden="true"]'
        );
        await this.crPage?.waitForTimeout(2000);
        // check if already likes
        const isLikable = await this.crPage?.$('span[aria-label="Like"]');
        if (isLikable) {
          await this.crPage?.click('span[aria-label="Like"]');
        }
        await this.crPage?.waitForTimeout(3000);
        // close modal
        const closedModalButton = await this.crPage?.$$(
          `xpath=${'//button[contains(text(), "Close")]'}`
        );
        //@ts-ignore
        await closedModalButton[0].click();
        await this.crPage?.waitForTimeout(1000);
      }
      await this.crPage?.waitForTimeout(10000);
    }
  }
}
