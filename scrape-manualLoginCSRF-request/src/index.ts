import cheerio from "cheerio";
import fetch from "node-fetch";
import FormData from "form-data";

(async () => {
  console.log("Getting token value");
  const initialResp = await fetch("http://quotes.toscrape.com/login");

  let cookie = initialResp.headers.get("Set-Cookie")?.split(";")[0];
  console.log(`Primeiro cookie${cookie}`);
  // @ts-ignore
  const $ = cheerio.load(await initialResp.text());

  const csrfToken = $('input[name="csrf_token"]').val();

  // Post request to login on the form
  const form = new FormData();
  form.append("username", "admin");
  form.append("password", "admin");
  form.append("csrf_token", csrfToken);

  console.log("Post request to login on the form");
  try {
    const loginReq = await fetch("http://quotes.toscrape.com/login", {
      method: "POST",
      // prettier-ignore
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "max-age=0",
        'Connection': 'keep-alive',
        'Host': 'quotes.toscrape.com',
        'Origin': 'http://quotes.toscrape.com',
        'Referer': 'http://quotes.toscrape.com/login',
        'Cookie': cookie as string,
        "Upgrade-Insecure-Requests": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
      },
      body: form,
      compress: true,
      redirect: "manual",
    });
    cookie = loginReq.headers.get("Set-Cookie")?.split(";")[0];
    console.log(`Segundo cookie${cookie}`);
    console.log(loginReq.status);
  } catch (error) {
    console.log(`macaco ${error}`);
  }

  console.log("Logged in, making request");
  const ha = await fetch("http://quotes.toscrape.com", {
    // prettier-ignore
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "max-age=0",
      'Connection': 'keep-alive',
      'Host': 'quotes.toscrape.com',
      'Origin': 'http://quotes.toscrape.com',
      'Referer': 'http://quotes.toscrape.com/login',
      'Cookie': cookie as string,
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
    },
    compress: true,
    method: "GET",
  });
  const checkIfLoggedIn = await ha.text();
  console.log(checkIfLoggedIn);
})();
