import * as Banner from "../models/Banner.js";

export async function getActiveBanners(req, res) {
  return res.json({ banners: await Banner.getActive() });
}
