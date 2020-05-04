import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";
import { Parser } from "json2csv";

const URLS = [
  {
    url: "https://www.imdb.com/title/tt3371366/?ref_=nv_sr_1?ref_=nv_sr_1",
    id: "filme1",
  },
  {
    url: "https://www.imdb.com/title/tt1131734/?ref_=nv_sr_7?ref_=nv_sr_7",
    id: "filme2",
  },
  {
    url: "https://www.imdb.com/title/tt2382009/?ref_=nv_sr_3?ref_=nv_sr_3",
    id: "filme3",
  },
];

const headers = {
  // prettier-ignore
  'accept':
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "accept-language": "en-US,en;q=0.9,en-US;q=0.8,en;q=0.7",
  "cache-control": "max-age=0",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36",
  "accept-encoding": "gzip, deflate, br",
};

(async () => {
  const moviesData = [];
  for (const movie of URLS) {
    const response = await fetch(movie.url, {
      method: "Get",
      headers,
      compress: true,
    });

    const respHtml = await response.text();

    const $ = cheerio.load(respHtml);
    //Scrapped infos
    const title = $('div[class="title_wrapper"] > h1').text().trim();
    const rating = $('div[class="ratingValue"] > strong').text();
    const poster = $('div[class="poster"] > a > img').attr("src");
    const ratingCount = $('span[itemprop="ratingCount"]').text();
    const releaseDate = $('a[title="See more release dates"]').text().trim();
    const genres: string[] = [];
    $('div[class="subtext"] > a[href^="/search/title?genres="]').each(
      function () {
        // @ts-ignore
        genres.push($(this).text());
      }
    );

    moviesData.push({
      title,
      ratingCount,
      rating,
      releaseDate,
      genres,
      poster,
    });

    //Download each img
    const file = fs.createWriteStream(`${movie.id}.jpg`);

    // Need the promise to await the download... Could have used pipeline
    await new Promise(async (resolve, reject) => {
      const stream = await fetch(poster as string, {
        method: "Get",
        headers,
        compress: true,
      });
      stream.body
        .pipe(file)
        .on("finish", () => {
          console.log("Finished downloading img");
          resolve();
        })
        .on("error", (err) => reject(err));
    }).catch((err) => console.log("Dei erro na promise da imagem"));
  }

  console.log(moviesData);

  // ##### Save as Data.json
  fs.writeFileSync("./data.json", JSON.stringify(moviesData), "utf-8");

  // ##### Save as .csv
  const fields = ["title", "rating", "releaseDate"];
  const opts = { fields };
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(moviesData);

    fs.writeFileSync("./data.csv", csv, "utf-8");
  } catch (err) {
    console.error(err);
  }
})();
