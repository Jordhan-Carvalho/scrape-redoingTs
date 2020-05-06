import cheerio from "cheerio";
import fetch from "node-fetch";

(async () => {
  const USERNAME = "ziinartist";
  const BASE_URL = `https://www.instagram.com/${USERNAME}`;

  const response = await fetch(BASE_URL);

  const $ = cheerio.load(await response.text());

  // If we inspect the page we can find that we have a full JSON response... so we get that
  const scriptTag = $('script[type="text/javascript"]').eq(3).html();

  const script_regex = /window._sharedData = (.+);/g.exec(scriptTag as string);

  //@ts-ignore
  //prettier-ignore
  const {entry_data: {ProfilePage: { [0] : {graphql: {user} }}}} = JSON.parse(script_regex[1]);

  const instaData = {
    followers: user.edge_followed_by.count,
    following: user.edge_follow.count,
    name: user.full_name,
    pictureUrl: user.profile_pic_url_hd,
    posts_number: user.edge_owner_to_timeline_media.count,
    posts_imgs: user.edge_owner_to_timeline_media.edges.map(
      (post: any) => post.node.display_url
    ),
  };

  console.log(instaData);
})();
