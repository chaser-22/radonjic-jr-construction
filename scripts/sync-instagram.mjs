import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const posts = [
  { url: "https://www.instagram.com/radonjicjrconstruction/p/DMhu9Z-NZ98/", file: "project-01.jpg" },
  { url: "https://www.instagram.com/radonjicjrconstruction/p/DL0UZyRtA0t/", file: "project-02.jpg" },
  { url: "https://www.instagram.com/radonjicjrconstruction/p/DLe82QWtNk3/", file: "project-03.jpg" },
  { url: "https://www.instagram.com/radonjicjrconstruction/p/DLUj4FJNyfs/", file: "project-04.jpg" }
];

const outDir = join(process.cwd(), "public", "instagram");
const headers = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9"
};

const decodeHtml = (value) => value
  .replaceAll("&amp;", "&")
  .replaceAll("\\u0026", "&")
  .replaceAll("\\/", "/");

function getCandidates(html) {
  const normalized = decodeHtml(html);
  const urls = normalized.match(/https:\/\/[^"'<>\s]+cdninstagram\.com\/[^"'<>\s]+?\.jpg[^"'<>\s]*/g) || [];
  const unique = [...new Set(urls.map((url) => url.replace(/[),]+$/, "")))];

  return unique
    .filter((url) => /\/v\/t51\.(?:75761|82787)-15\//.test(url))
    .sort((a, b) => score(b) - score(a));
}

function score(url) {
  let value = 0;
  if (/\.xpids\.(?:1080|1440)\./.test(url)) value += 80;
  if (/regular_photo/.test(url)) value += 60;
  if (/CAROUSEL_ITEM/.test(url)) value += 45;
  if (/FEED/.test(url)) value += 30;
  if (/s640x640|s320x320|s150x150/.test(url)) value -= 80;
  if (/c\d+\.\d+\.\d+\.\d+a_/.test(url)) value -= 45;
  if (/video_default_cover_frame/.test(url)) value -= 20;
  return value;
}

async function syncPost({ url, file }) {
  const page = await fetch(url, { headers, redirect: "follow" });
  if (!page.ok) throw new Error(`Instagram page returned ${page.status}`);

  const html = await page.text();
  const candidates = getCandidates(html);

  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

  if (ogMatch?.[1]) candidates.push(decodeHtml(ogMatch[1]));

  let lastError = null;
  for (const imageUrl of [...new Set(candidates)]) {
    try {
      const image = await fetch(imageUrl, { headers: { ...headers, referer: url } });
      const type = image.headers.get("content-type") || "";
      if (!image.ok || !type.startsWith("image/")) continue;
      const bytes = new Uint8Array(await image.arrayBuffer());
      if (bytes.byteLength < 25000) continue;
      await writeFile(join(outDir, file), bytes);
      console.log(`Instagram asset synced: ${file} (${Math.round(bytes.byteLength / 1024)} KB)`);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No usable Instagram image found");
}

await mkdir(outDir, { recursive: true });

const results = await Promise.allSettled(posts.map(syncPost));
const failed = results.filter((result) => result.status === "rejected");

if (failed.length) {
  for (const result of failed) console.warn("Instagram sync warning:", result.reason?.message || result.reason);
  console.warn(`Instagram sync completed with ${failed.length} missing asset(s); website fallbacks will be used.`);
}
