import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const uploadsDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/banners");
const ALLOWED_TYPES = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/gif", "gif"]]);

export async function uploadBannerImage(req, res) {
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(req.body.dataUrl || "");
  if (!match) return res.status(400).json({ message: "Upload a JPG, PNG, WebP or GIF image" });
  const image = Buffer.from(match[2], "base64");
  if (image.length > 5 * 1024 * 1024) return res.status(400).json({ message: "Image must be 5 MB or smaller" });
  await fs.mkdir(uploadsDirectory, { recursive: true });
  const filename = `${randomUUID()}.${ALLOWED_TYPES.get(match[1])}`;
  await fs.writeFile(path.join(uploadsDirectory, filename), image);
  return res.status(201).json({ url: `${req.protocol}://${req.get("host")}/uploads/banners/${filename}` });
}
