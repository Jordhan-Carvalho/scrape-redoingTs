import playwright from "playwright";

(async () => {
  const crBrowser = await playwright.chromium.launch({
    headless: false,
    args: ["--proxy-server=35.233.5.198:3128"],
  });
  const crContext = await crBrowser.newContext();
  const crPage = await crContext.newPage();

  // Log and continue all network requests -- InterceptedRequest from puppeter example
  crPage.route("**", (route) => {
    console.log(route.request().url());
    if (
      ["image", "stylesheet", "font"].includes(route.request().resourceType())
    )
      route.abort();
    else route.continue();
  });

  await crPage.goto("https://httpbin.org/ip");
  // await crPage.close();
})();
