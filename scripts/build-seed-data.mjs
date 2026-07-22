import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const uploadsDir = path.join(root, "public", "uploads");

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extFromUrl(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

const CATEGORIES = [
  "Wireless Chargers",
  "Power Banks",
  "Earbuds",
  "Charging Stations",
  "Sustainable Hampers",
  "Corporate Gifting",
];

function deriveTags(name, category) {
  const tags = new Set();
  const lower = name.toLowerCase();

  if (lower.includes("bamboo")) tags.add("Bamboo");
  if (lower.includes("cork")) tags.add("Cork");
  if (lower.includes("15w") || lower.includes("fast charg")) tags.add("Fast Charge");
  if (lower.includes("magsafe")) tags.add("MagSafe");
  if (/\d{4,5}mah/.test(lower)) tags.add(lower.match(/(\d{4,5})mah/)[1] + "mAh");
  if (category === "Sustainable Hampers" || category === "Corporate Gifting") tags.add("Gift Set");
  if (category === "Wireless Chargers") tags.add("Wireless Charging");

  return Array.from(tags).slice(0, 4);
}

function blurbFor(name, description, category) {
  if (description && description.length > 20) {
    const firstSentence = description.split(/•|\n/).find((s) => s.trim().length > 15);
    if (firstSentence) return firstSentence.trim().slice(0, 160);
  }
  if (category === "Power Banks") return `${name} — reliable, portable power for everyday devices.`;
  if (category === "Wireless Chargers") return `${name} — fast, cable-free charging made sustainably.`;
  if (category === "Earbuds") return `${name} — eco-friendly sound, crafted with care.`;
  if (category === "Sustainable Hampers") return `${name} — a curated sustainable gifting set.`;
  if (category === "Corporate Gifting") return `${name} — thoughtful corporate gifting, done sustainably.`;
  return `${name} — an eco-friendly Wangari original.`;
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(destPath, buf);
    return true;
  } catch (err) {
    console.warn(`  ! failed ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  await mkdir(uploadsDir, { recursive: true });
  const raw = JSON.parse(await readFile(path.join(__dirname, "raw-products.json"), "utf-8"));

  const products = [];
  let i = 0;
  for (const item of raw) {
    i += 1;
    const slug = slugify(item.name);
    const localImages = [];

    process.stdout.write(`[${i}/${raw.length}] ${item.name} (${item.images.length} imgs)... `);
    for (const [idx, url] of item.images.entries()) {
      const ext = extFromUrl(url);
      const fileName = `${slug}-${idx + 1}.${ext}`;
      const destPath = path.join(uploadsDir, fileName);
      const ok = await downloadImage(url, destPath);
      if (ok) localImages.push(`/uploads/${fileName}`);
    }
    console.log(localImages.length > 0 ? `OK (${localImages.length})` : "SKIPPED (no images)");

    products.push({
      slug,
      name: item.name,
      blurb: blurbFor(item.name, item.description, item.category),
      category: item.category,
      subcategory: null,
      price: item.price,
      image: localImages[0] ?? "",
      images: localImages,
      tags: deriveTags(item.name, item.category),
    });
  }

  const seedData = {
    categories: CATEGORIES.map((name) => ({ name, subcategories: [] })),
    products,
  };

  await writeFile(
    path.join(root, "prisma", "seed-data.json"),
    JSON.stringify(seedData, null, 2)
  );
  console.log(`\nWrote ${products.length} products to prisma/seed-data.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
