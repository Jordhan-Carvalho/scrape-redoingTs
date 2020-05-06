import { Instagram } from "./ig";
import { Utils } from "./utils";

interface userData {
  name: string;
  password: string;
}

(async () => {
  const resp: userData = await Utils.getUserData();

  const ig = new Instagram();

  await ig.initialize();

  await ig.login(resp.name, resp.password);

  await ig.likeTags(["barreiras", "lem"]);
})();
