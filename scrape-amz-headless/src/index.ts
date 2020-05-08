import { Amazon } from "./amazon";

(async () => {
  const az = new Amazon();

  await az.initialize();

  // const prod = await az.singleProdDetail(
  //   "https://www.amazon.com/dp/B01KR1C5PY/ref=nav_timeline_asin?_encoding=UTF8&psc=1"
  // );

  const todayDeal = await az.getTodaysDeal();

  console.log(todayDeal.length);

  // await az.end();
})();
