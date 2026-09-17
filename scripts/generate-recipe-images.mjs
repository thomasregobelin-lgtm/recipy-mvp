import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY (run with: node --env-file=.env.local scripts/generate-recipe-images.mjs)");
  process.exit(1);
}

const MODEL = "gemini-2.5-flash-image";
const STYLE = "Professional food photography, natural daylight, rustic wooden table, shallow depth of field, appetizing, top-down or 3/4 angle, square framing, no text, no watermark, no hands, high detail.";

const RECIPES = [
  { slug: "raviolis-creme-jambon-beurre", desc: "A plate of fresh ravioli pasta coated in a creamy sauce with strips of ham and melted butter, garnished lightly." },
  { slug: "pates-carbonara", desc: "A plate of spaghetti carbonara with crispy bacon lardons, creamy egg and parmesan sauce, cracked black pepper on top." },
  { slug: "curry-pois-chiches", desc: "A bowl of chickpea curry in a rich tomato and coconut sauce, garnished with fresh coriander, steam rising." },
  { slug: "poulet-roti-herbes", desc: "A whole roasted herb chicken, golden brown skin, on a rustic baking tray with sprigs of thyme and garlic cloves." },
  { slug: "salade-lentilles-feta-tomates", desc: "A fresh salad bowl with green lentils, cubed feta cheese, cherry tomatoes, and a light olive oil dressing." },
  { slug: "risotto-champignons", desc: "A creamy mushroom risotto in a shallow bowl, topped with sauteed mushroom slices and grated parmesan." },
  { slug: "omelette-fines-herbes", desc: "A golden folded herb omelette on a white plate, garnished with fresh chives, a rustic kitchen setting." },
  { slug: "chili-sin-carne", desc: "A bowl of vegetarian chili with red beans, corn, bell peppers in a rich tomato sauce, garnished with coriander." },
  { slug: "saumon-riz-brocolis", desc: "A pan-seared salmon fillet with a plate of steamed white rice and bright green broccoli florets." },
  { slug: "soupe-potiron-chataigne", desc: "A bowl of creamy orange pumpkin and chestnut soup, swirl of cream on top, autumnal rustic setting." },
  { slug: "tartines-avocat-oeuf-poche", desc: "Toasted sourdough bread topped with smashed avocado and a poached egg with runny yolk, sesame seeds." },
  { slug: "tajine-legumes", desc: "A colorful vegetable tajine with carrots, zucchini and chickpeas in a spiced sauce, served in a traditional tajine dish." },
  { slug: "gratin-dauphinois", desc: "A golden baked potato gratin dauphinois in a ceramic dish, creamy layers visible, crispy browned top." },
  { slug: "poke-bowl-thon-mangue", desc: "A vibrant poke bowl with cubed raw tuna, diced mango, sushi rice, cucumber, and sesame seeds, top-down view." },
  { slug: "pancakes-moelleux", desc: "A stack of fluffy pancakes on a plate, drizzle of syrup, small pat of butter melting on top, cozy breakfast scene." },
  { slug: "quiche-lorraine", desc: "A sliced quiche lorraine with golden pastry crust, visible bacon and egg custard filling, rustic wooden board." },
  { slug: "bowl-quinoa-legumes-rotis-houmous", desc: "A quinoa bowl with roasted zucchini and bell peppers, a dollop of hummus, drizzle of olive oil, top-down view." },
  { slug: "croque-monsieur", desc: "A golden grilled croque-monsieur sandwich with melted gruyere cheese on top, cut in half showing ham inside." },
];

const outDir = path.join(process.cwd(), "public", "recipes");
fs.mkdirSync(outDir, { recursive: true });

async function generateOne(desc) {
  const prompt = `${desc} ${STYLE}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    }
  );
  const bodyText = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${bodyText.slice(0, 500)}`);
  const json = JSON.parse(bodyText);
  const parts = json.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) throw new Error("No image returned: " + JSON.stringify(json).slice(0, 500));
  const mime = imgPart.inlineData.mimeType || "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  return { buffer: Buffer.from(imgPart.inlineData.data, "base64"), ext };
}

let ok = 0, fail = 0;
for (const r of RECIPES) {
  const existing = fs.readdirSync(outDir).find((f) => f.startsWith(r.slug + "."));
  if (existing) {
    console.log(`skip (already exists): ${r.slug}`);
    ok++;
    continue;
  }
  try {
    console.log(`generating: ${r.slug}`);
    const { buffer, ext } = await generateOne(r.desc);
    fs.writeFileSync(path.join(outDir, `${r.slug}.${ext}`), buffer);
    console.log(`  -> saved ${r.slug}.${ext} (${(buffer.length / 1024).toFixed(0)} KB)`);
    ok++;
  } catch (err) {
    console.error(`  !! failed ${r.slug}:`, err.message);
    fail++;
  }
}
console.log(`Done. ${ok} ok, ${fail} failed.`);
