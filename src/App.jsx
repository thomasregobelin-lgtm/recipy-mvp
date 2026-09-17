import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, X, Info, ChevronLeft, ChevronRight, Plus, Trash2, Check,
  Pencil, ShoppingCart, CalendarDays, BookOpen, Sparkles, User,
  Search, ArrowLeft, RotateCcw, Minus, Image as ImageIcon, Menu, Utensils,
  SlidersHorizontal
} from "lucide-react";

/* ----------------------------------------------------------------------
   Utilitaires
---------------------------------------------------------------------- */

let __idCounter = 0;
const uid = (prefix) => {
  __idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${__idCounter}${Math.random().toString(36).slice(2, 6)}`;
};

const normalizeName = (s) => s.trim().toLowerCase();
const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DAY_LABELS = { lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi", jeudi: "Jeudi", vendredi: "Vendredi", samedi: "Samedi", dimanche: "Dimanche" };
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const DOW_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DOW_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const DIFFICULTIES = ["facile", "moyen", "difficile"];
const UNITS = ["g", "kg", "ml", "l", "pièce", "tranche", "sachet", "paquet", "boîte", "barquette", "pot", "cuillère à soupe", "cuillère à café", "pincée"];

/* ----------------------------------------------------------------------
   Données de démarrage
---------------------------------------------------------------------- */

const TAG_NAMES = [
  "végétarien", "végan", "sans gluten", "sans lactose", "grossesse",
  "rapide", "économique", "riche en protéines", "sucré", "hiver", "été",
];

const SEED_RECIPES = [
  {
    titre: "Raviolis, crème, jambon, beurre",
    photo: "/recipes/raviolis-creme-jambon-beurre.jpg",
    temps_preparation: 10, difficulte: "facile", prix_estime: 4,
    tags: ["rapide", "économique"],
    etapes: ["Faire chauffer une noix de beurre dans une poêle.", "Ajouter les raviolis et un fond d'eau, couvrir 5 min.", "Ajouter la crème et le jambon coupé en lanières, mélanger 2 min à feu doux."],
    ingredients: [{ nom: "raviolis frais", quantite: 500, unite: "g" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }, { nom: "jambon blanc", quantite: 2, unite: "pièce" }, { nom: "beurre", quantite: 20, unite: "g" }],
  },
  {
    titre: "Pâtes à la carbonara",
    photo: "/recipes/pates-carbonara.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 6,
    tags: ["rapide"],
    etapes: ["Cuire les pâtes dans l'eau bouillante salée.", "Faire revenir les lardons à sec.", "Mélanger œufs, parmesan et poivre dans un bol.", "Égoutter les pâtes, mélanger hors du feu avec les lardons puis l'appareil œufs-parmesan."],
    ingredients: [{ nom: "spaghetti", quantite: 400, unite: "g" }, { nom: "lardons", quantite: 200, unite: "g" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "parmesan", quantite: 60, unite: "g" }, { nom: "poivre", quantite: 1, unite: "pincée" }],
  },
  {
    titre: "Curry de pois chiches",
    photo: "/recipes/curry-pois-chiches.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 5,
    tags: ["végan", "économique", "sans gluten"],
    etapes: ["Faire revenir oignon et ail dans l'huile.", "Ajouter les épices puis les tomates concassées, laisser réduire 5 min.", "Ajouter les pois chiches et le lait de coco, mijoter 15 min."],
    ingredients: [{ nom: "pois chiches cuits", quantite: 400, unite: "g" }, { nom: "lait de coco", quantite: 400, unite: "ml" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "ail", quantite: 2, unite: "pièce" }, { nom: "curry en poudre", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Poulet rôti aux herbes",
    photo: "/recipes/poulet-roti-herbes.jpg",
    temps_preparation: 90, difficulte: "moyen", prix_estime: 12,
    tags: ["riche en protéines", "hiver"],
    etapes: ["Préchauffer le four à 200°C.", "Frotter le poulet avec beurre, thym et ail.", "Enfourner 1h15 en arrosant régulièrement."],
    ingredients: [{ nom: "poulet entier", quantite: 1, unite: "pièce" }, { nom: "beurre", quantite: 40, unite: "g" }, { nom: "thym", quantite: 1, unite: "cuillère à café" }, { nom: "ail", quantite: 3, unite: "pièce" }],
  },
  {
    titre: "Salade de lentilles, feta, tomates",
    photo: "/recipes/salade-lentilles-feta-tomates.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 5,
    tags: ["végétarien", "été", "rapide"],
    etapes: ["Rincer les lentilles cuites.", "Couper tomates et feta en dés.", "Mélanger le tout avec un filet d'huile d'olive et du vinaigre."],
    ingredients: [{ nom: "lentilles cuites", quantite: 300, unite: "g" }, { nom: "feta", quantite: 100, unite: "g" }, { nom: "tomate", quantite: 3, unite: "pièce" }, { nom: "huile d'olive", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Risotto aux champignons",
    photo: "/recipes/risotto-champignons.jpg",
    temps_preparation: 35, difficulte: "moyen", prix_estime: 7,
    tags: ["végétarien"],
    etapes: ["Faire revenir l'oignon émincé dans du beurre.", "Ajouter le riz, nacrer 2 min.", "Verser le bouillon louche par louche en remuant jusqu'à absorption complète, 20 min.", "Ajouter les champignons poêlés et le parmesan hors du feu."],
    ingredients: [{ nom: "riz arborio", quantite: 300, unite: "g" }, { nom: "champignons de paris", quantite: 250, unite: "g" }, { nom: "bouillon de légumes", quantite: 1, unite: "l" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "parmesan", quantite: 50, unite: "g" }, { nom: "beurre", quantite: 30, unite: "g" }],
  },
  {
    titre: "Omelette aux fines herbes",
    photo: "/recipes/omelette-fines-herbes.jpg",
    temps_preparation: 10, difficulte: "facile", prix_estime: 2,
    tags: ["rapide", "économique", "végétarien"],
    etapes: ["Battre les œufs avec sel, poivre et herbes.", "Cuire dans une poêle beurrée à feu moyen, plier en deux."],
    ingredients: [{ nom: "œuf", quantite: 4, unite: "pièce" }, { nom: "ciboulette", quantite: 1, unite: "cuillère à soupe" }, { nom: "beurre", quantite: 10, unite: "g" }],
  },
  {
    titre: "Chili sin carne",
    photo: "/recipes/chili-sin-carne.jpg",
    temps_preparation: 40, difficulte: "moyen", prix_estime: 5,
    tags: ["végan", "économique", "hiver"],
    etapes: ["Faire revenir oignon, poivron et ail.", "Ajouter tomates concassées, haricots rouges, maïs et épices.", "Laisser mijoter 25 min à couvert."],
    ingredients: [{ nom: "haricots rouges cuits", quantite: 400, unite: "g" }, { nom: "maïs", quantite: 200, unite: "g" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "piment doux", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Saumon, riz, brocolis",
    photo: "/recipes/saumon-riz-brocolis.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 9,
    tags: ["riche en protéines", "sans gluten"],
    etapes: ["Cuire le riz.", "Cuire le saumon à la poêle 4 min de chaque côté.", "Cuire les brocolis à la vapeur 8 min."],
    ingredients: [{ nom: "pavé de saumon", quantite: 2, unite: "pièce" }, { nom: "riz basmati", quantite: 150, unite: "g" }, { nom: "brocoli", quantite: 300, unite: "g" }],
  },
  {
    titre: "Soupe potiron-châtaigne",
    photo: "/recipes/soupe-potiron-chataigne.jpg",
    temps_preparation: 35, difficulte: "facile", prix_estime: 4,
    tags: ["végan", "hiver", "économique", "sans gluten"],
    etapes: ["Faire revenir l'oignon.", "Ajouter le potiron coupé et les châtaignes, couvrir d'eau.", "Cuire 25 min puis mixer."],
    ingredients: [{ nom: "potiron", quantite: 800, unite: "g" }, { nom: "châtaignes cuites", quantite: 200, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Tartines avocat, œuf poché",
    photo: "/recipes/tartines-avocat-oeuf-poche.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 4,
    tags: ["végétarien", "rapide"],
    etapes: ["Griller le pain.", "Écraser l'avocat avec citron, sel, poivre sur les tartines.", "Pocher les œufs 3 min dans l'eau frémissante vinaigrée, déposer sur les tartines."],
    ingredients: [{ nom: "pain de campagne", quantite: 4, unite: "pièce" }, { nom: "avocat", quantite: 2, unite: "pièce" }, { nom: "œuf", quantite: 2, unite: "pièce" }, { nom: "citron", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Tajine de légumes",
    photo: "/recipes/tajine-legumes.jpg",
    temps_preparation: 50, difficulte: "moyen", prix_estime: 6,
    tags: ["végan", "sans gluten", "hiver"],
    etapes: ["Faire revenir oignon et épices.", "Ajouter carottes, courgettes, pois chiches et un peu d'eau.", "Mijoter 35 min à couvert."],
    ingredients: [{ nom: "carotte", quantite: 3, unite: "pièce" }, { nom: "courgette", quantite: 2, unite: "pièce" }, { nom: "pois chiches cuits", quantite: 300, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "cumin", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Gratin dauphinois",
    photo: "/recipes/gratin-dauphinois.jpg",
    temps_preparation: 75, difficulte: "moyen", prix_estime: 4,
    tags: ["végétarien", "hiver", "économique"],
    etapes: ["Préchauffer le four à 180°C.", "Couper les pommes de terre en fines rondelles.", "Disposer en couches dans un plat avec crème, lait, ail et muscade.", "Cuire 1h15."],
    ingredients: [{ nom: "pomme de terre", quantite: 1, unite: "kg" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }, { nom: "lait", quantite: 20, unite: "cl" }, { nom: "ail", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Poke bowl thon-mangue",
    photo: "/recipes/poke-bowl-thon-mangue.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 8,
    tags: ["été", "riche en protéines", "sans gluten"],
    etapes: ["Cuire le riz vinaigré.", "Couper thon, mangue et concombre en dés.", "Dresser le bol et ajouter sésame et sauce soja."],
    ingredients: [{ nom: "thon frais", quantite: 200, unite: "g" }, { nom: "riz à sushi", quantite: 150, unite: "g" }, { nom: "mangue", quantite: 1, unite: "pièce" }, { nom: "concombre", quantite: 1, unite: "pièce" }, { nom: "graines de sésame", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Pancakes moelleux",
    photo: "/recipes/pancakes-moelleux.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 3,
    tags: ["sucré", "économique"],
    etapes: ["Mélanger farine, levure, sucre et sel.", "Ajouter œuf, lait et beurre fondu, fouetter.", "Cuire des petites louches à la poêle 2 min de chaque côté."],
    ingredients: [{ nom: "farine", quantite: 250, unite: "g" }, { nom: "lait", quantite: 30, unite: "cl" }, { nom: "œuf", quantite: 2, unite: "pièce" }, { nom: "sucre", quantite: 2, unite: "cuillère à soupe" }, { nom: "levure chimique", quantite: 1, unite: "cuillère à café" }, { nom: "beurre", quantite: 30, unite: "g" }],
  },
  {
    titre: "Quiche lorraine",
    photo: "/recipes/quiche-lorraine.jpg",
    temps_preparation: 50, difficulte: "moyen", prix_estime: 5,
    tags: ["économique"],
    etapes: ["Préchauffer le four à 190°C.", "Foncer un moule avec la pâte.", "Mélanger œufs, crème, lardons, verser sur la pâte.", "Cuire 35 min."],
    ingredients: [{ nom: "pâte brisée", quantite: 1, unite: "pièce" }, { nom: "lardons", quantite: 200, unite: "g" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }],
  },
  {
    titre: "Bowl quinoa, légumes rôtis, houmous",
    photo: "/recipes/bowl-quinoa-legumes-rotis-houmous.jpg",
    temps_preparation: 35, difficulte: "facile", prix_estime: 6,
    tags: ["végan", "sans gluten", "riche en protéines"],
    etapes: ["Cuire le quinoa.", "Rôtir les légumes coupés 25 min à 200°C avec huile d'olive.", "Dresser le bol avec le houmous."],
    ingredients: [{ nom: "quinoa", quantite: 150, unite: "g" }, { nom: "courgette", quantite: 1, unite: "pièce" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "houmous", quantite: 100, unite: "g" }, { nom: "huile d'olive", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Croque-monsieur",
    photo: "/recipes/croque-monsieur.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 3,
    tags: ["rapide", "économique"],
    etapes: ["Tartiner le pain de béchamel.", "Garnir de jambon et de gruyère râpé.", "Passer au four ou à la poêle jusqu'à ce que ce soit doré."],
    ingredients: [{ nom: "pain de mie", quantite: 4, unite: "pièce" }, { nom: "jambon blanc", quantite: 2, unite: "pièce" }, { nom: "gruyère râpé", quantite: 100, unite: "g" }, { nom: "béchamel", quantite: 100, unite: "g" }],
  },
];

function buildSeedData() {
  const tags = TAG_NAMES.map((nom) => ({ id: uid("tag"), nom }));
  const tagIdByName = Object.fromEntries(tags.map((t) => [t.nom, t.id]));

  const ingredients = [];
  const ingredientIdByName = {};
  const getOrCreateIngredient = (nom, unite) => {
    const key = normalizeName(nom);
    if (ingredientIdByName[key]) return ingredientIdByName[key];
    const ing = { id: uid("ing"), nom: key, unite_reference: unite, photo: null, formats: [] };
    ingredients.push(ing);
    ingredientIdByName[key] = ing.id;
    return ing.id;
  };

  const recipes = SEED_RECIPES.map((r) => ({
    id: uid("rec"),
    titre: r.titre,
    photo: r.photo || null,
    etapes: r.etapes,
    temps_preparation: r.temps_preparation,
    difficulte: r.difficulte,
    prix_estime: r.prix_estime,
    portions: 4,
    calories: r.calories || "",
    proteines: r.proteines || "",
    lipides: r.lipides || "",
    origine: "app",
    liked: false,
    ingredients: r.ingredients.map((i) => ({
      ingredient_id: getOrCreateIngredient(i.nom, i.unite),
      quantite: i.quantite,
      unite: i.unite,
    })),
    tag_ids: r.tags.map((t) => tagIdByName[t]).filter(Boolean),
  }));

  return {
    ingredients,
    recipes,
    tags,
    weeklyPlan: [], // { id, date: "AAAA-MM-JJ", recipe_id }
    shoppingList: [], // { id, ingredient_id, quantite_totale, unite, coche, source: "plan" | "manuel" }
    userProfile: { tags_preferences: [], compte: { nom: "", email: "" } },
    swipeDeckSeenIds: [],
  };
}

/* ----------------------------------------------------------------------
   Helpers de données purs (indépendants du composant, pas de closure
   sur l'état — c'est ce qui permet aux composants d'écran/modale de
   vivre au niveau module et de ne jamais être démontés en cours d'usage)
---------------------------------------------------------------------- */

function getOrCreateIngredientByName(draft, nom, unite) {
  const key = normalizeName(nom);
  let ing = draft.ingredients.find((i) => i.nom === key);
  if (!ing) {
    ing = { id: uid("ing"), nom: key, unite_reference: unite || "", photo: null, formats: [] };
    draft.ingredients.push(ing);
  }
  return ing;
}

// Convertit la liste structurée d'ingrédients d'une recette en texte libre,
// une ligne par ingrédient (ex. "500 g raviolis frais", "2 tomates"), pour
// l'afficher dans le champ "Ingrédients" façon Recipy.
function ingredientLinesFromRecipe(data, recipe) {
  return (recipe.ingredients || []).map((fi) => {
    const nom = fi.__nom ? fi.__nom : ingredientName(data, fi.ingredient_id).toLowerCase();
    const qte = fi.quantite || "";
    if (!fi.unite || fi.unite === "pièce") return `${qte} ${nom}`.trim();
    return `${qte} ${fi.unite} ${nom}`.trim();
  }).join("\n");
}

// Parse une ligne de texte libre ("2 tomates", "500 g raviolis frais",
// "Une poignée d'herbes") en { nom, quantite, unite }. Best-effort : si aucune
// quantité n'est détectée en tête de ligne, toute la ligne devient le nom.
const UNITS_SORTED_DESC = [...UNITS].sort((a, b) => b.length - a.length);
function parseIngredientLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)\s*(.*)$/);
  if (!m || !m[2]) return { nom: trimmed, quantite: 1, unite: "" };
  let quantite = m[1].includes("/")
    ? (([a, b]) => (b ? Number(a) / Number(b) : Number(a)))(m[1].split("/").map((s) => s.trim()))
    : Number(m[1].replace(",", "."));
  if (!quantite || Number.isNaN(quantite)) quantite = 1;
  let rest = m[2].trim();
  let unite = "";
  for (const u of UNITS_SORTED_DESC) {
    const escaped = u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^${escaped}s?\\b`, "i");
    if (re.test(rest)) { unite = u; rest = rest.replace(re, "").trim(); break; }
  }
  rest = rest.replace(/^(de |d[’'])/i, "").trim();
  return { nom: rest || trimmed, quantite, unite };
}
function parseIngredientsText(text) {
  return text.split("\n").map(parseIngredientLine).filter(Boolean);
}

// Devine un rayon pour un ingrédient, uniquement pour regrouper visuellement la
// liste de courses (aucun système de stock/catalogue derrière — juste de l'affichage).
const CATEGORY_ORDER = ["Fruits & légumes", "Frais", "Boucherie & poisson", "Épicerie", "Surgelé", "Boissons", "Autre"];
const CATEGORY_KEYWORDS = {
  "Fruits & légumes": ["tomate", "avocat", "citron", "carotte", "courgette", "oignon", "ail", "poivron", "pomme de terre", "salade", "concombre", "brocoli", "champignon", "potiron", "châtaigne", "mangue", "radis", "herbe", "basilic", "ciboulette", "thym", "persil", "fruit", "légume", "banane", "pomme", "poire", "orange", "épinard", "haricot vert"],
  "Frais": ["crème", "lait", "beurre", "œuf", "fromage", "parmesan", "feta", "gruyère", "yaourt", "béchamel", "houmous"],
  "Boucherie & poisson": ["poulet", "lardons", "jambon", "saumon", "thon", "viande", "steak", "poisson", "bœuf", "porc", "dinde"],
  "Épicerie": ["pâtes", "spaghetti", "riz", "farine", "sucre", "sel", "poivre", "épice", "curry", "cumin", "huile", "vinaigre", "levure", "pain", "quinoa", "lentille", "pois chiche", "haricot rouge", "maïs", "conserve", "café", "thé", "biscuit"],
  "Surgelé": ["surgelé", "glace"],
  "Boissons": ["eau", "jus", "soda", "vin", "bière"],
};
function guessCategory(nom) {
  const n = normalizeName(nom);
  for (const cat of CATEGORY_ORDER) {
    const kws = CATEGORY_KEYWORDS[cat];
    if (kws && kws.some((k) => n.includes(k))) return cat;
  }
  return "Autre";
}

function ingredientName(data, id) {
  const i = data.ingredients.find((x) => x.id === id);
  return i ? capitalize(i.nom) : "?";
}
function tagName(data, id) {
  const t = data.tags.find((x) => x.id === id);
  return t ? t.nom : "?";
}
function recipeUsesIngredient(data, ingredientId) {
  return data.recipes.filter((r) => r.ingredients.some((i) => i.ingredient_id === ingredientId));
}

// Conversion simple entre unités compatibles (g/kg, ml/l) pour comparer formats et quantités.
// Dates : calendrier réel (année / mois / jour), au format ISO "AAAA-MM-JJ" en interne.
const pad2 = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const mondayOf = (d) => { const offset = (d.getDay() + 6) % 7; return addDays(d, -offset); };
const todayDate = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
// Grille d'un mois : tableau de semaines, chaque semaine un tableau de 7 dates (lundi -> dimanche),
// avec les jours des mois voisins nécessaires pour compléter les semaines.
function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const firstOffset = (first.getDay() + 6) % 7;
  const start = addDays(first, -firstOffset);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const numWeeks = Math.ceil((firstOffset + daysInMonth) / 7);
  const weeks = [];
  for (let w = 0; w < numWeeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) week.push(addDays(start, w * 7 + d));
    weeks.push(week);
  }
  return weeks;
}

// Migration : d'anciennes sauvegardes utilisaient un planning à semaine-type unique
// (entrées { jour: "lundi"... }). On les reporte sur la semaine réelle en cours, sans les perdre.
function migrateWeeklyPlan(d) {
  const monday = mondayOf(todayDate());
  d.weeklyPlan = (d.weeklyPlan || []).map((p) => {
    if (!p.date) {
      const idx = DAYS.indexOf(p.jour);
      const date = isoDate(addDays(monday, idx >= 0 ? idx : 0));
      p = { id: p.id, date, recipe_id: p.recipe_id };
    }
    return p.moment ? p : { ...p, moment: "midi" };
  });
  if (!d.userProfile.compte) d.userProfile.compte = { nom: "", email: "" };
  d.shoppingList = (d.shoppingList || []).map((s) => s.source ? s : { ...s, source: "plan" });
  return d;
}

/* ----------------------------------------------------------------------
   Styles (design system maison — pas de kit générique)
---------------------------------------------------------------------- */

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap');

  .mp-root {
    --bg: #FBEEDA;
    --surface: #FFFFFF;
    --surface-2: #F6E9C8;
    --ink: #2A2015;
    --ink-soft: #8A7A64;
    --ink-faint: #CCBEA0;
    --terracotta: #F0653D;
    --terracotta-deep: #D94F29;
    --gold: #F0B429;
    --gold-deep: #D99A0F;
    --sage: #3F7D46;
    --sage-deep: #2F5F37;
    --line: #EFE1C4;
    --danger: #B33B2E;
    --ice: #8FA3A8;
    --plum: #9C7B85;
    font-family: 'Work Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .mp-root * { box-sizing: border-box; }
  .mp-serif { font-family: 'Fraunces', serif; }

  /* Application mobile : on centre un cadre au format téléphone sur la page
     pour prévisualiser fidèlement le rendu, même sur un écran large. */
  .mp-phone-page {
    min-height: 100vh; min-height: 100dvh; width: 100%;
    display: flex; align-items: center; justify-content: center;
    background: #2A2015; padding: 24px 12px;
  }
  .mp-phone-shell {
    width: 100%; max-width: 402px; height: min(874px, 94vh);
    border-radius: 46px; overflow: hidden; position: relative;
    box-shadow: 0 30px 70px rgba(0,0,0,.45);
    border: 10px solid #0d0a06;
  }
  @media (max-width: 640px) {
    .mp-phone-page { padding: 0; background: var(--bg); align-items: stretch; }
    .mp-phone-shell { max-width: 100%; width: 100%; height: 100vh; height: 100dvh; border-radius: 0; border: none; box-shadow: none; }
  }
  @media (max-height: 620px) {
    .mp-phone-shell { height: 100vh; height: 100dvh; }
  }

  .mp-nav {
    width: 100%; flex-shrink: 0; order: 2;
    border-top: 1px solid var(--line);
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 8px 4px calc(8px + env(safe-area-inset-bottom, 0px));
    gap: 2px;
  }
  .mp-nav-brand { display: none; }
  .mp-topbar {
    display: flex; justify-content: flex-end; margin-bottom: 8px;
  }
  .mp-profile-active {
    background: var(--terracotta); border-color: var(--terracotta); color: #fff;
  }
  .mp-nav-btn {
    width: 62px;
    padding: 6px 4px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink-soft);
    font-size: 9.5px;
    letter-spacing: 0.01em;
    border-radius: 10px;
    transition: background .15s ease, color .15s ease;
  }
  .mp-nav-icon-wrap { display: flex; align-items: center; justify-content: center; }
  .mp-nav-btn:hover { background: var(--surface-2); color: var(--ink); }
  .mp-nav-btn.active { background: transparent; color: var(--sage); }
  .mp-nav-btn.active .mp-nav-icon-wrap { color: var(--sage); }
  .mp-nav-btn.center .mp-nav-icon-wrap {
    width: 46px; height: 46px; border-radius: 50%; background: var(--ink); color: #fff;
    display: flex; align-items: center; justify-content: center; margin-bottom: 2px;
    transition: transform .15s ease;
  }
  .mp-nav-btn.center { color: var(--ink); }
  .mp-nav-btn.center.active { color: var(--ink); }
  .mp-nav-btn.center:hover .mp-nav-icon-wrap { transform: scale(1.05); }

  .mp-main {
    flex: 1;
    min-width: 0;
    min-height: 0;
    order: 1;
    padding: calc(16px + env(safe-area-inset-top, 0px)) calc(16px + env(safe-area-inset-right, 0px)) 18px calc(16px + env(safe-area-inset-left, 0px));
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .mp-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
  .mp-title { font-size: 22px; font-weight: 500; margin: 0; }
  .mp-sub { color: var(--ink-soft); font-size: 12.5px; margin-top: 3px; }

  .mp-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 24px; border: 1px solid var(--line);
    background: var(--surface); color: var(--ink); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: border-color .15s ease, background .15s ease;
  }
  .mp-btn:hover { border-color: var(--ink-faint); }
  .mp-btn-primary { background: var(--gold); border-color: var(--gold); color: var(--ink); }
  .mp-btn-primary:hover { background: var(--gold-deep); border-color: var(--gold-deep); }
  .mp-btn-coral { background: var(--terracotta); border-color: var(--terracotta); color: #fff; }
  .mp-btn-coral:hover { background: var(--terracotta-deep); border-color: var(--terracotta-deep); }
  .mp-btn-sage { background: var(--sage); border-color: var(--sage); color: #fff; }
  .mp-btn-sage:hover { background: var(--sage-deep); border-color: var(--sage-deep); }
  .mp-btn-ghost { background: transparent; border-color: transparent; }
  .mp-btn-ghost:hover { background: var(--surface-2); }
  .mp-btn-danger { color: var(--danger); border-color: var(--line); background: var(--surface); }
  .mp-btn-danger:hover { background: #F3E3DF; border-color: var(--danger); }
  .mp-btn:disabled { opacity: .4; cursor: not-allowed; }
  .mp-btn-icon { padding: 8px; border-radius: 24px; }

  .mp-input, .mp-select, .mp-textarea {
    width: 100%; padding: 9px 11px; border-radius: 8px; border: 1px solid var(--line);
    background: var(--surface); color: var(--ink); font-family: inherit; font-size: 14px;
  }
  .mp-input:focus, .mp-select:focus, .mp-textarea:focus { outline: 2px solid var(--terracotta); outline-offset: 1px; }
  .mp-label { font-size: 12px; text-transform: none; color: var(--ink-soft); display: block; margin-bottom: 5px; }
  .mp-field { margin-bottom: 14px; }

  .mp-tag {
    display: inline-flex; align-items: center; gap: 4px; padding: 4px 11px;
    border-radius: 20px; font-size: 12px; border: none; background: var(--surface-2);
    color: var(--terracotta-deep); cursor: default; font-weight: 600;
  }
  .mp-tag.clickable { cursor: pointer; }
  .mp-tag.selected { background: var(--terracotta); border-color: var(--terracotta); color: #fff; }
  .mp-tag.selected.tone-sage { background: var(--sage); border-color: var(--sage); color: #fff; }

  .mp-card {
    background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 16px;
  }

  /* Swipe deck */
  .mp-deck-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding-top: 0; }
  .mp-deck { position: relative; width: 100%; max-width: 320px; height: min(48dvh, 400px); }
  .mp-swipe-card {
    position: absolute; inset: 0; border-radius: 32px; background: var(--surface);
    border: none; display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 8px 24px rgba(160,20,70,.16); cursor: grab; user-select: none;
  }
  .mp-swipe-photo-wrap { height: 48%; flex-shrink: 0; position: relative; overflow: hidden; }
  .mp-swipe-photo {
    height: 100%; background: var(--surface-2);
    display: flex; align-items: center; justify-content: center; color: var(--terracotta);
    font-family: 'Fraunces', serif; font-size: 38px; overflow: hidden;
  }
  .mp-swipe-photo img, .mp-rcard-photo img { width: 100%; height: 100%; object-fit: cover; }
  .mp-mini-thumb {
    width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 2px solid var(--surface); background: var(--surface-2);
    display: flex; align-items: center; justify-content: center; color: var(--terracotta);
    font-family: 'Fraunces', serif; font-size: 14px;
  }
  .mp-mini-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .mp-swipe-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .mp-swipe-title { font-size: 16px; font-weight: 600; margin: 0; }
  .mp-swipe-meta { font-size: 12.5px; color: var(--ink-soft); display: flex; gap: 12px; flex-wrap: wrap; }
  .mp-swipe-stamp {
    position: absolute; top: 26px; padding: 6px 14px; border: 3px solid; border-radius: 8px;
    font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; transform: rotate(-14deg);
    pointer-events: none;
  }
  .mp-deck-actions { display: flex; align-items: center; gap: 18px; }
  .mp-round-btn {
    width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface);
    display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-soft);
  }
  .mp-round-btn.like { background: var(--terracotta); border-color: var(--terracotta); color: #fff; }
  .mp-round-btn.pass { width: 40px; height: 40px; background: var(--surface-2); border-color: var(--surface-2); color: var(--ink); }
  .mp-round-btn.info { width: 38px; height: 38px; background: var(--sage); border-color: var(--sage); color: #fff; }
  .mp-round-btn:hover { filter: brightness(0.97); }

  /* Badges & pastilles style Recipy */
  .mp-photo-badge {
    position: absolute; top: 12px; left: 12px; padding: 4px 12px; border-radius: 20px;
    background: var(--sage); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .02em;
    text-transform: uppercase;
  }
  .mp-photo-like {
    position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%;
    background: var(--terracotta); color: #fff; display: flex; align-items: center; justify-content: center;
  }
  .mp-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--sage); }
  .mp-eyebrow.coral { color: var(--terracotta); }
  .mp-stat-row { display: flex; gap: 8px; }
  .mp-stat-pill {
    flex: 1; border-radius: 14px; padding: 10px 8px; text-align: center; background: var(--surface-2);
  }
  .mp-stat-pill .mp-stat-value { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; color: var(--ink); }
  .mp-stat-pill .mp-stat-label { font-size: 9.5px; text-transform: uppercase; color: var(--ink-soft); letter-spacing: .03em; }

  /* Barre de progression */
  .mp-progress-card { background: var(--gold); border-radius: 20px; padding: 16px 18px; }
  .mp-progress-label { font-size: 12px; color: var(--ink); opacity: .75; margin-bottom: 4px; }
  .mp-progress-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .mp-progress-count { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; color: var(--ink); }
  .mp-progress-pct { font-size: 13px; color: var(--ink); opacity: .75; }
  .mp-progress-track { height: 8px; border-radius: 5px; background: rgba(255,255,255,.5); overflow: hidden; }
  .mp-progress-fill { height: 100%; background: var(--ink); border-radius: 5px; transition: width .2s ease; }

  .mp-tip-banner { background: var(--sage); color: #fff; border-radius: 20px; padding: 16px 18px; }
  .mp-tip-eyebrow { font-size: 10.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; opacity: .85; margin-bottom: 6px; }
  .mp-tip-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 600; margin: 0 0 4px; }
  .mp-tip-body { font-size: 13px; opacity: .92; line-height: 1.4; }

  .mp-day-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .mp-day-chip {
    flex-shrink: 0; width: 52px; padding: 10px 0; border-radius: 16px; background: var(--surface);
    border: 1px solid var(--line); display: flex; flex-direction: column; align-items: center; gap: 2px;
    cursor: pointer; color: var(--ink-soft);
  }
  .mp-day-chip .mp-day-num { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: var(--ink); }
  .mp-day-chip.selected { background: var(--ink); border-color: var(--ink); }
  .mp-day-chip.selected .mp-day-num { color: #fff; }
  .mp-day-chip.selected .mp-day-name { color: #fff; }
  .mp-day-name { font-size: 10.5px; text-transform: capitalize; }

  .mp-meal-card {
    display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--line);
    border-radius: 18px; padding: 10px; cursor: pointer;
  }
  .mp-meal-thumb {
    width: 54px; height: 54px; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: var(--surface-2);
    display: flex; align-items: center; justify-content: center; color: var(--terracotta); font-family: 'Fraunces', serif;
  }
  .mp-meal-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .mp-meal-slot-empty {
    display: flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px dashed var(--line);
    border-radius: 18px; padding: 16px; cursor: pointer; color: var(--ink-soft); font-size: 13.5px;
  }
  .mp-meal-slot-empty:hover { border-color: var(--ink-faint); color: var(--ink); }

  .mp-shop-section-title { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; margin: 18px 0 8px; display: flex; justify-content: space-between; align-items: baseline; }
  .mp-shop-section-count { font-size: 12.5px; color: var(--ink-soft); font-family: 'Work Sans', sans-serif; font-weight: 400; }
  .mp-shop-check-round {
    width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--sage); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--surface); color: transparent;
  }
  .mp-shop-check-round.checked { background: var(--sage); border-color: var(--sage); color: #fff; }

  .mp-empty { text-align: center; color: var(--ink-soft); padding: 50px 20px; max-width: 380px; }

  /* Recipe grid */
  .mp-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .mp-rcard {
    background: var(--surface); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; cursor: pointer; position: relative;
  }
  .mp-rcard-photo {
    aspect-ratio: 1 / 1; background: var(--surface-2);
    display: flex; align-items: center; justify-content: center; color: var(--terracotta);
    font-family: 'Fraunces', serif; font-size: 30px; position: relative; overflow: hidden;
  }
  .mp-rcard-body { padding: 11px 13px; }
  .mp-rcard-title { font-size: 14.5px; font-weight: 500; margin: 0 0 4px; }
  .mp-rcard-meta { font-size: 11.5px; color: var(--ink-soft); }
  .mp-checkbox-overlay {
    position: absolute; top: 8px; left: 8px; width: 22px; height: 22px; border-radius: 6px;
    background: rgba(255,255,255,.85); display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(46,42,34,.2); z-index: 2;
  }
  .mp-checkbox-overlay.checked { background: var(--terracotta); border-color: var(--terracotta); color: #fff; }

  /* Modal */
  .mp-overlay {
    position: absolute; inset: 0; background: rgba(46,42,34,.42); display: flex; align-items: flex-start;
    justify-content: center; padding: 16px 10px; overflow-y: auto; z-index: 50;
  }
  .mp-modal {
    background: var(--surface); border-radius: 26px; width: 100%; max-width: 620px; padding: 18px 16px 22px;
    border: 1px solid var(--line);
  }
  .mp-modal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; gap: 12px; }

  /* Planning */
  .mp-plan-item {
    background: var(--surface-2); border-radius: 8px; padding: 7px 9px; font-size: 12.5px; margin-bottom: 6px;
    display: flex; justify-content: space-between; align-items: center; gap: 6px;
  }

  .mp-cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 10px; flex-wrap: wrap; }

  /* Shopping */
  .mp-shop-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--line);
  }
  .mp-shop-item:last-child { border-bottom: none; }
  .mp-shop-name { flex: 1; font-size: 14.5px; }
  .mp-shop-name.checked { text-decoration: line-through; color: var(--ink-faint); }
  .mp-shop-qty { font-size: 13px; color: var(--ink-soft); }

  .mp-scroll-x { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }

  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-thumb { background: var(--ink-faint); border-radius: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }

  .mp-topbar { margin-bottom: 4px; }
`;


/* ----------------------------------------------------------------------
   Petits composants
---------------------------------------------------------------------- */

function TagPill({ children, selected, onClick, small, tone }) {
  return (
    <span className={`mp-tag ${onClick ? "clickable" : ""} ${selected ? "selected" : ""} ${tone ? `tone-${tone}` : ""}`} onClick={onClick} style={small ? { fontSize: 11, padding: "3px 8px" } : undefined}>
      {children}
    </span>
  );
}

function Modal({ onClose, children, width }) {
  return (
    <div className="mp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mp-modal" style={width ? { maxWidth: width } : undefined}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div className="mp-empty">
      <div style={{ marginBottom: 10, opacity: 0.5 }}>{icon}</div>
      <div className="mp-serif" style={{ fontSize: 17, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

// Vignette recette : affiche la photo si présente, sinon l'initiale sur fond dégradé.
function RecipeThumb({ recipe, className, style }) {
  return (
    <div className={className} style={style}>
      {recipe.photo ? <img src={recipe.photo} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : recipe.titre[0]?.toUpperCase()}
    </div>
  );
}

/* ----------------------------------------------------------------------
   Écrans (composants de niveau module — jamais redéfinis en cours de
   rendu, donc jamais démontés/remontés par erreur : le focus des champs
   et les saisies en cours survivent aux mises à jour de données)
---------------------------------------------------------------------- */

function CreateScreen({ data, update }) {
  const emptyForm = { titre: "", photo: null, temps: "30 min", portions: 4, ingredientsText: "", etapesText: "", difficulte: "", prix_estime: "", calories: "", proteines: "", lipides: "", tag_ids: [] };
  const [form, setForm] = useState(emptyForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);

  // Import d'un fichier local : redimensionné et compressé en JPEG avant stockage.
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 640;
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else if (height >= width && height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        setForm((f) => ({ ...f, photo: dataUrl }));
        setPhotoBusy(false);
      };
      img.onerror = () => setPhotoBusy(false);
      img.src = reader.result;
    };
    reader.onerror = () => setPhotoBusy(false);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!form.titre.trim()) return;
    update((d) => {
      const resolvedIngredients = parseIngredientsText(form.ingredientsText).map(({ nom, quantite, unite }) => {
        const ing = getOrCreateIngredientByName(d, nom, unite);
        return { ingredient_id: ing.id, quantite, unite };
      });
      const etapes = form.etapesText.split("\n").map((s) => s.trim()).filter(Boolean);
      const tempsMatch = form.temps.match(/\d+/);
      d.recipes.push({
        id: uid("rec"), titre: form.titre.trim(), photo: form.photo, etapes,
        temps_preparation: tempsMatch ? Number(tempsMatch[0]) : "", difficulte: form.difficulte,
        prix_estime: form.prix_estime, portions: form.portions,
        calories: form.calories, proteines: form.proteines, lipides: form.lipides,
        origine: "utilisateur", liked: false, ingredients: resolvedIngredients, tag_ids: form.tag_ids,
      });
      return d;
    });
    setForm(emptyForm);
    setShowMoreOptions(false);
  };

  return (
    <div>
      <div className="mp-header">
        <div>
          <div className="mp-eyebrow">Votre nouvelle recette</div>
          <h1 className="mp-serif mp-title">Créer</h1>
        </div>
        <div className="mp-round-btn" style={{ width: 38, height: 38, background: "var(--surface-2)", color: "var(--terracotta)", cursor: "default" }} title="Assistant IA (bientôt)">
          <Sparkles size={17} />
        </div>
      </div>

      <div className="mp-field">
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
        <div onClick={() => fileInputRef.current?.click()} style={{
          border: "1.5px dashed var(--line)", borderRadius: 20, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: form.photo ? 0 : "38px 16px", overflow: "hidden", minHeight: 150,
        }}>
          {form.photo ? (
            <img src={form.photo} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
          ) : (
            <>
              <ImageIcon size={22} style={{ marginBottom: 8, color: "var(--ink)" }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{photoBusy ? "Import…" : "Ajouter une belle photo"}</div>
            </>
          )}
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-label">Nom de la recette</label>
        <input className="mp-input" placeholder="Ex. Curry doré du dimanche" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label className="mp-label">Temps</label>
          <input className="mp-input" value={form.temps} onChange={(e) => setForm((f) => ({ ...f, temps: e.target.value }))} />
        </div>
        <div>
          <label className="mp-label">Portions</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 37 }}>
            <button className="mp-round-btn" style={{ width: 30, height: 30 }} onClick={() => setForm((f) => ({ ...f, portions: Math.max(1, f.portions - 1) }))}><Minus size={13} /></button>
            <span className="mp-serif" style={{ fontSize: 16, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{form.portions}</span>
            <button className="mp-round-btn" style={{ width: 30, height: 30 }} onClick={() => setForm((f) => ({ ...f, portions: f.portions + 1 }))}><Plus size={13} /></button>
          </div>
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-label">Ingrédients</label>
        <textarea className="mp-textarea" rows={4} placeholder={"2 tomates\n1 citron\nUne poignée d'herbes"}
          value={form.ingredientsText} onChange={(e) => setForm((f) => ({ ...f, ingredientsText: e.target.value }))} />
      </div>

      <div className="mp-field">
        <label className="mp-label">Préparation</label>
        <textarea className="mp-textarea" rows={5} placeholder="Décrivez les étapes simplement…"
          value={form.etapesText} onChange={(e) => setForm((f) => ({ ...f, etapesText: e.target.value }))} />
      </div>

      <button className="mp-btn mp-btn-ghost" style={{ marginBottom: 14 }} onClick={() => setShowMoreOptions((s) => !s)}>
        {showMoreOptions ? "Moins d'options" : "Plus d'options"}
      </button>

      {showMoreOptions && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label className="mp-label">Difficulté</label>
              <select className="mp-select" value={form.difficulte} onChange={(e) => setForm((f) => ({ ...f, difficulte: e.target.value }))}>
                <option value="">—</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mp-label">Prix estimé (€)</label>
              <input className="mp-input" type="number" value={form.prix_estime} onChange={(e) => setForm((f) => ({ ...f, prix_estime: e.target.value }))} />
            </div>
          </div>

          <div className="mp-field">
            <label className="mp-label">Valeurs nutritionnelles (par portion, optionnel)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input className="mp-input" type="number" placeholder="kcal" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} />
              <input className="mp-input" type="number" placeholder="Protéines (g)" value={form.proteines} onChange={(e) => setForm((f) => ({ ...f, proteines: e.target.value }))} />
              <input className="mp-input" type="number" placeholder="Lipides (g)" value={form.lipides} onChange={(e) => setForm((f) => ({ ...f, lipides: e.target.value }))} />
            </div>
          </div>

          <div className="mp-field">
            <label className="mp-label">Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.tags.map((t) => (
                <TagPill key={t.id} selected={form.tag_ids.includes(t.id)}
                  onClick={() => setForm((f) => ({ ...f, tag_ids: f.tag_ids.includes(t.id) ? f.tag_ids.filter((x) => x !== t.id) : [...f.tag_ids, t.id] }))}>
                  {t.nom}
                </TagPill>
              ))}
            </div>
          </div>
        </>
      )}

      <button className="mp-btn mp-btn-sage" style={{ width: "100%", justifyContent: "center", color: "#fff" }} onClick={handleSave} disabled={!form.titre.trim()}>
        <Sparkles size={15} /> Enregistrer la recette
      </button>
    </div>
  );
}

function DiscoverScreen({ data, deckRecipes, profileTagIds, useProfileFilter, setUseProfileFilter, discoverFilterTags, setDiscoverFilterTags, toggleLike, markSeen, resetDeck, setRecipeModal }) {
  const top = deckRecipes[0];
  const [drag, setDrag] = useState({ x: 0, active: false });
  const startX = useRef(0);

  const onDown = (e) => {
    startX.current = (e.touches ? e.touches[0].clientX : e.clientX);
    setDrag({ x: 0, active: true });
  };
  const onMove = (e) => {
    if (!drag.active) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    setDrag({ x: cx - startX.current, active: true });
  };
  const resolveSwipe = (dir) => {
    if (!top) return;
    if (dir === "like") toggleLike(top.id); else markSeen(top.id);
    setDrag({ x: 0, active: false });
  };
  const onUp = () => {
    if (!drag.active) return;
    if (drag.x > 110) resolveSwipe("like");
    else if (drag.x < -110) resolveSwipe("pass");
    else setDrag({ x: 0, active: false });
  };

  return (
    <div>
      <div className="mp-header">
        <div>
          <div className="mp-eyebrow">{data.recipes.length} recettes à découvrir</div>
          <h1 className="mp-serif mp-title">Swipe</h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {profileTagIds.length > 0 && (
            <TagPill onClick={() => setUseProfileFilter((v) => !v)} selected={useProfileFilter}>
              Filtrer selon mon profil
            </TagPill>
          )}
          <button className="mp-btn mp-btn-ghost" onClick={resetDeck}><RotateCcw size={14} /> Revoir tout</button>
        </div>
      </div>

      {!useProfileFilter && (
        <div className="mp-scroll-x" style={{ marginBottom: 20 }}>
          {data.tags.map((t) => (
            <TagPill key={t.id} selected={discoverFilterTags.includes(t.id)}
              onClick={() => setDiscoverFilterTags((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id])}>
              {t.nom}
            </TagPill>
          ))}
        </div>
      )}

      <div className="mp-deck-wrap">
        <div className="mp-deck">
          {!top && (
            <EmptyState icon={<Sparkles size={32} />} title="Plus rien à découvrir"
              body="Tu as vu toutes les recettes qui correspondent à ces filtres. Reviens plus tard ou relance la pile." />
          )}
          {deckRecipes.slice(0, 3).reverse().map((r, i, arr) => {
            const isTop = i === arr.length - 1;
            const style = isTop
              ? { transform: `translateX(${drag.x}px) rotate(${drag.x / 18}deg)`, transition: drag.active ? "none" : "transform .25s ease", zIndex: 3 }
              : { transform: `scale(${0.96 - (arr.length - 1 - i) * 0.03}) translateY(${(arr.length - 1 - i) * 8}px)`, zIndex: 2 - (arr.length - 1 - i) };
            return (
              <div key={r.id} className="mp-swipe-card" style={style}
                onMouseDown={isTop ? onDown : undefined} onMouseMove={isTop ? onMove : undefined}
                onMouseUp={isTop ? onUp : undefined} onMouseLeave={isTop ? onUp : undefined}
                onTouchStart={isTop ? onDown : undefined} onTouchMove={isTop ? onMove : undefined} onTouchEnd={isTop ? onUp : undefined}
                onDoubleClick={isTop ? () => setRecipeModal(r.id) : undefined}>
                {isTop && drag.x > 40 && <div className="mp-swipe-stamp" style={{ left: 20, borderColor: "var(--sage)", color: "var(--sage-deep)" }}>J'aime</div>}
                {isTop && drag.x < -40 && <div className="mp-swipe-stamp" style={{ right: 20, borderColor: "var(--danger)", color: "var(--danger)" }}>Passer</div>}
                <div className="mp-swipe-photo-wrap">
                  <RecipeThumb recipe={r} className="mp-swipe-photo" />
                  {r.tag_ids[0] && <span className="mp-photo-badge">{tagName(data, r.tag_ids[0])}</span>}
                  {r.liked && <span className="mp-photo-like"><Heart size={15} fill="currentColor" /></span>}
                </div>
                <div className="mp-swipe-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="mp-eyebrow coral">Recette du jour</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>N° {data.recipes.findIndex((x) => x.id === r.id) + 1}</span>
                  </div>
                  <p className="mp-serif mp-swipe-title">{r.titre}</p>
                  <div className="mp-swipe-meta">
                    {r.temps_preparation ? <span>{r.temps_preparation} min</span> : null}
                    {r.difficulte ? <span>{r.difficulte}</span> : null}
                    {r.portions ? <span>{r.portions} pers</span> : null}
                  </div>
                  {(r.calories || r.proteines || r.lipides) ? (
                    <div className="mp-stat-row" style={{ marginTop: 2 }}>
                      {r.calories ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.calories}</div><div className="mp-stat-label">kcal</div></div> : null}
                      {r.proteines ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.proteines} g</div><div className="mp-stat-label">Protéines</div></div> : null}
                      {r.lipides ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.lipides} g</div><div className="mp-stat-label">Lipides</div></div> : null}
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
                      {r.tag_ids.slice(0, 3).map((tid) => <TagPill key={tid} small>{tagName(data, tid)}</TagPill>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {top && (
          <div className="mp-deck-actions">
            <button className="mp-round-btn pass" onClick={() => resolveSwipe("pass")} aria-label="Passer"><X size={20} /></button>
            <button className="mp-round-btn info" style={{ width: 58, height: 58 }} onClick={() => setRecipeModal(top.id)} aria-label="Détails"><Info size={22} /></button>
            <button className="mp-round-btn like" onClick={() => resolveSwipe("like")} aria-label="J'aime"><Heart size={20} fill="currentColor" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function LikedScreen({ data, likedRecipes, likedSelection, setLikedSelection, setRecipeModal, update }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("toutes"); // "toutes" | "express" | "vege"
  const [selectMode, setSelectMode] = useState(false);
  const vegeTag = data.tags.find((t) => normalizeName(t.nom).includes("vég"));
  const todayISO = isoDate(todayDate());
  const tonightRecipeIds = new Set(data.weeklyPlan.filter((p) => p.date === todayISO && p.moment === "soir").map((p) => p.recipe_id));

  const allSelected = likedRecipes.length > 0 && likedSelection.length === likedRecipes.length;
  const toggleSelect = (id) => setLikedSelection((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setLikedSelection(allSelected ? [] : likedRecipes.map((r) => r.id));
  const bulkRemove = () => {
    update((d) => { d.recipes.forEach((r) => { if (likedSelection.includes(r.id)) r.liked = false; }); return d; });
    setLikedSelection([]);
  };
  const closeSelectMode = () => { setSelectMode(false); setLikedSelection([]); };

  const q = normalizeName(query);
  const visible = likedRecipes.filter((r) => {
    if (q && !normalizeName(r.titre).includes(q)) return false;
    if (filter === "express" && !(r.temps_preparation && r.temps_preparation <= 20)) return false;
    if (filter === "vege" && !(vegeTag && r.tag_ids.includes(vegeTag.id))) return false;
    return true;
  });

  return (
    <div>
      <div className="mp-header">
        <div>
          <div className="mp-eyebrow">{likedRecipes.length} recette{likedRecipes.length !== 1 ? "s" : ""} gardée{likedRecipes.length !== 1 ? "s" : ""}</div>
          <h1 className="mp-serif mp-title">Mes likes</h1>
        </div>
        {likedRecipes.length > 0 && (
          selectMode ? (
            <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={closeSelectMode} aria-label="Fermer la sélection"><X size={15} /></button>
          ) : (
            <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => setSelectMode(true)} aria-label="Sélectionner"><SlidersHorizontal size={15} /></button>
          )
        )}
      </div>

      {selectMode && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button className="mp-btn mp-btn-ghost" onClick={toggleAll}>{allSelected ? "Tout désélectionner" : "Tout sélectionner"}</button>
          {likedSelection.length > 0 && <button className="mp-btn mp-btn-danger" onClick={bulkRemove}><Trash2 size={14} /> Retirer ({likedSelection.length})</button>}
        </div>
      )}

      {likedRecipes.length > 0 && (
        <>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} style={{ position: "absolute", left: 13, top: 12, color: "var(--ink-faint)" }} />
            <input className="mp-input" style={{ paddingLeft: 34, borderRadius: 24 }} placeholder="Chercher une recette" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            <TagPill tone="sage" selected={filter === "toutes"} onClick={() => setFilter("toutes")}>Toutes</TagPill>
            <TagPill tone="sage" selected={filter === "express"} onClick={() => setFilter("express")}>Express</TagPill>
            {vegeTag && <TagPill tone="sage" selected={filter === "vege"} onClick={() => setFilter("vege")}>Végé</TagPill>}
          </div>
        </>
      )}

      {likedRecipes.length === 0 ? (
        <EmptyState icon={<Heart size={32} />} title="Aucune recette likée" body="Va faire un tour dans Swipe pour liker des recettes, qu'elles viennent du catalogue ou que tu les aies créées toi-même." />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search size={32} />} title="Aucun résultat" body="Aucune recette likée ne correspond à cette recherche ou à ce filtre." />
      ) : (
        <div className="mp-grid">
          {visible.map((r) => {
            const eyebrow = tonightRecipeIds.has(r.id) ? "Ce soir ?" : (r.tag_ids[0] ? tagName(data, r.tag_ids[0]) : null);
            return (
              <div key={r.id} className="mp-rcard" onClick={() => (selectMode ? toggleSelect(r.id) : setRecipeModal(r.id))}>
                <div style={{ position: "relative" }}>
                  <RecipeThumb recipe={r} className="mp-rcard-photo" />
                  <span className="mp-photo-like" style={{ top: 8, right: 8, width: 28, height: 28 }}><Heart size={13} fill="currentColor" /></span>
                </div>
                <div className="mp-rcard-body">
                  {eyebrow && (
                    <div className={`mp-eyebrow ${tonightRecipeIds.has(r.id) ? "coral" : ""}`} style={{ marginBottom: 3 }}>{eyebrow}</div>
                  )}
                  <p className="mp-rcard-title">{r.titre}</p>
                  <div className="mp-rcard-meta">
                    {[r.temps_preparation ? `${r.temps_preparation} min` : null, r.calories ? `${r.calories} kcal` : null, r.difficulte].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {selectMode && (
                  <div className={`mp-checkbox-overlay ${likedSelection.includes(r.id) ? "checked" : ""}`}
                    style={{ position: "absolute", top: 8, left: 8 }}
                    onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}>
                    {likedSelection.includes(r.id) && <Check size={14} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function MealSlotPicker({ dateISO, moment, dayLabel, likedRecipes, weekRecipeIds, onPick, onClose }) {
  const [query, setQuery] = useState("");
  const q = normalizeName(query);
  const filtered = likedRecipes.filter((r) => normalizeName(r.titre).includes(q));
  return (
    <Modal onClose={onClose} width={420}>
      <div className="mp-modal-head">
        <h2 className="mp-serif" style={{ fontSize: 19, margin: 0, textTransform: "capitalize" }}>{dayLabel} — {moment}</h2>
        <button className="mp-round-btn" style={{ width: 32, height: 32 }} onClick={onClose}><X size={15} /></button>
      </div>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <Search size={14} style={{ position: "absolute", left: 11, top: 11, color: "var(--ink-faint)" }} />
        <input className="mp-input" style={{ paddingLeft: 32 }} autoFocus placeholder="Rechercher une recette…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {likedRecipes.length === 0 ? (
        <div className="mp-sub">Like d'abord quelques recettes pour pouvoir les planifier.</div>
      ) : (
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {filtered.map((r) => {
            const already = weekRecipeIds.has(r.id);
            return (
              <div key={r.id} onClick={() => onPick(r.id)}
                style={{ cursor: "pointer", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", marginBottom: 6, opacity: already ? 0.55 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.titre}</span>
                  {already && <span style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>déjà planifié</span>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>
                  {[r.temps_preparation ? `${r.temps_preparation} min` : null, r.difficulte].filter(Boolean).join(" · ")}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="mp-sub">Aucune recette ne correspond.</div>}
        </div>
      )}
    </Modal>
  );
}

const MOMENT_TIME = { midi: "12:30", soir: "19:30" };
const MOMENT_LABEL = { midi: "Déjeuner", soir: "Dîner" };

function PlanningScreen({ data, likedRecipes, addToPlan, removeFromPlan, clearWeek, generateShoppingList, setRecipeModal }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [picker, setPicker] = useState(null); // { dateISO, dayIdx, moment } | null

  const monday = mondayOf(addDays(todayDate(), weekOffset * 7));
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekDatesISO = weekDates.map(isoDate);
  const todayISO = isoDate(todayDate());
  const weekPlanItems = data.weeklyPlan.filter((p) => weekDatesISO.includes(p.date));
  const weekPlanCount = weekPlanItems.length;
  const weekRecipeIds = new Set(weekPlanItems.map((p) => p.recipe_id));

  const [selectedISO, setSelectedISO] = useState(() => (weekDatesISO.includes(todayISO) ? todayISO : weekDatesISO[0]));
  useEffect(() => { if (!weekDatesISO.includes(selectedISO)) setSelectedISO(weekDatesISO[0]); }, [weekOffset]); // eslint-disable-line

  const weekLabelPrefix = weekOffset === 0 ? "Cette semaine" : weekOffset === 1 ? "Semaine prochaine" : weekOffset === -1 ? "Semaine dernière"
    : weekOffset > 0 ? `Dans ${weekOffset} sem.` : `Il y a ${Math.abs(weekOffset)} sem.`;

  const findSlot = (dateISO, moment) => weekPlanItems.find((p) => p.date === dateISO && p.moment === moment);
  const selectedIdx = weekDatesISO.indexOf(selectedISO);
  const selectedDayName = DOW_LONG[selectedIdx >= 0 ? selectedIdx : 0];
  const selectedDayNum = weekDates[selectedIdx >= 0 ? selectedIdx : 0]?.getDate();
  const selectedSlots = ["midi", "soir"].map((moment) => ({ moment, slot: findSlot(selectedISO, moment) }));
  const selectedFilledCount = selectedSlots.filter((s) => s.slot).length;
  const remaining = weekDatesISO.length * 2 - weekPlanCount;

  return (
    <div>
      <div className="mp-header" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="mp-eyebrow">{weekLabelPrefix}</div>
          <h1 className="mp-serif mp-title">Planning</h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => setWeekOffset((o) => o - 1)}><ChevronLeft size={15} /></button>
          <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => setWeekOffset((o) => o + 1)}><ChevronRight size={15} /></button>
          <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => clearWeek(weekDatesISO)} aria-label="Vider la semaine" disabled={weekPlanCount === 0}><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="mp-day-strip" style={{ marginBottom: 18 }}>
        {weekDates.map((d, i) => {
          const iso = isoDate(d);
          return (
            <div key={iso} className={`mp-day-chip ${iso === selectedISO ? "selected" : ""}`} onClick={() => setSelectedISO(iso)}>
              <span className="mp-day-num">{d.getDate()}</span>
              <span className="mp-day-name">{DOW_SHORT[i]}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <h2 className="mp-serif" style={{ fontSize: 19, margin: 0, textTransform: "capitalize" }}>
          {selectedDayName} {selectedDayNum}{selectedISO === todayISO ? " · Aujourd'hui" : ""}
        </h2>
        <span className="mp-sub" style={{ margin: 0 }}>{selectedFilledCount} repas</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {selectedSlots.map(({ moment, slot }) => {
          const recipe = slot ? data.recipes.find((r) => r.id === slot.recipe_id) : null;
          return recipe ? (
            <div key={moment} className="mp-meal-card" onClick={() => setRecipeModal(recipe.id)}>
              <RecipeThumb recipe={recipe} className="mp-meal-thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mp-eyebrow" style={{ fontSize: 10 }}>{MOMENT_LABEL[moment].toUpperCase()} · {MOMENT_TIME[moment]}</div>
                <div className="mp-serif" style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{recipe.titre}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                  {[recipe.temps_preparation ? `${recipe.temps_preparation} min` : null, recipe.portions ? `${recipe.portions} pers` : null].filter(Boolean).join(" · ")}
                </div>
              </div>
              <Trash2 size={15} style={{ cursor: "pointer", flexShrink: 0, color: "var(--ink-faint)" }} onClick={(e) => { e.stopPropagation(); removeFromPlan(slot.id); }} />
            </div>
          ) : (
            <div key={moment} className="mp-meal-slot-empty" onClick={() => setPicker({ dateISO: selectedISO, dayIdx: selectedIdx, moment })}>
              <Plus size={15} /> Ajouter un repas du {moment === "midi" ? "midi" : "soir"}…
            </div>
          );
        })}
      </div>

      <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 16 }}
        onClick={() => generateShoppingList(weekDatesISO[0])} disabled={weekPlanCount === 0}>
        <ShoppingCart size={14} /> Générer une liste de courses
      </button>

      {remaining > 0 && (
        <div className="mp-tip-banner">
          <div className="mp-tip-eyebrow">Petit coup de pouce</div>
          <p className="mp-tip-title">{weekPlanCount === 0 ? "Votre semaine est vide." : "Votre semaine est presque prête."}</p>
          <div className="mp-tip-body">
            {weekPlanCount === 0
              ? "Ajoutez vos premiers repas pour pouvoir générer une liste de courses complète."
              : `Ajoutez encore ${remaining} repas pour générer une liste complète.`}
          </div>
        </div>
      )}

      {picker && (
        <MealSlotPicker dateISO={picker.dateISO} moment={picker.moment} dayLabel={DOW_LONG[picker.dayIdx]}
          likedRecipes={likedRecipes} weekRecipeIds={weekRecipeIds}
          onPick={(recipeId) => { addToPlan(picker.dateISO, picker.moment, recipeId); setPicker(null); }}
          onClose={() => setPicker(null)} />
      )}
    </div>
  );
}

function AddShoppingItemModal({ data, onClose, onAdd }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState("1");
  const [unit, setUnit] = useState(UNITS[0]);
  const matches = !selected && query.trim() ? data.ingredients.filter((i) => i.nom.includes(normalizeName(query))).slice(0, 6) : [];
  const pick = (ing) => { setSelected(ing); setQuery(capitalize(ing.nom)); setUnit(ing.unite_reference || UNITS[0]); };
  const canSubmit = query.trim().length > 0;
  const submit = () => {
    if (!canSubmit) return;
    // Si l'article existe déjà (sélectionné dans les suggestions), on réutilise son id.
    // Sinon on envoie directement le nom saisi : ça permet d'ajouter n'importe quel
    // article — alimentaire ou non (Sopalin, dentifrice…) — même absent de la bibliothèque
    // d'ingrédients, un nouvel ingrédient étant créé automatiquement.
    onAdd(selected ? selected.id : query.trim(), Number(qty) || 1, unit);
    onClose();
  };
  return (
    <Modal onClose={onClose} width={360}>
      <div className="mp-modal-head">
        <h2 className="mp-serif" style={{ fontSize: 19, margin: 0 }}>Ajouter à la liste</h2>
        <button className="mp-round-btn" style={{ width: 32, height: 32 }} onClick={onClose}><X size={15} /></button>
      </div>
      <div className="mp-field" style={{ position: "relative" }}>
        <label className="mp-label">Article</label>
        <input className="mp-input" autoFocus placeholder="Rechercher ou saisir un nouvel article…" value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }} />
        {matches.length > 0 && (
          <div style={{ position: "absolute", top: 62, left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, zIndex: 5 }}>
            {matches.map((m) => (
              <div key={m.id} style={{ padding: "7px 10px", cursor: "pointer", fontSize: 13 }} onClick={() => pick(m)}>
                {capitalize(m.nom)}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mp-field" style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1 }}>
          <label className="mp-label">Qté</label>
          <input className="mp-input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div style={{ flex: 1.3 }}>
          <label className="mp-label">Unité</label>
          <select className="mp-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={submit} disabled={!canSubmit}><Plus size={14} /> Ajouter</button>
    </Modal>
  );
}

function ShoppingScreen({ data, generateShoppingList, toggleShoppingItem, clearShoppingList, addManualShoppingItem, removeShoppingItem, goToPlanning }) {
  const [weekStart, setWeekStart] = useState(() => isoDate(mondayOf(todayDate())));
  const [showAddItem, setShowAddItem] = useState(false);
  const weekStartDate = parseISO(weekStart);
  const weekEndDate = addDays(weekStartDate, 6);
  const weekPlanItemsInRange = data.weeklyPlan.filter((p) => { const pd = parseISO(p.date); return pd >= weekStartDate && pd <= weekEndDate; });
  const weekPlanCount = weekPlanItemsInRange.length;
  const weekPlanRecipes = [...new Set(weekPlanItemsInRange.map((p) => p.recipe_id))]
    .map((id) => data.recipes.find((r) => r.id === id)).filter(Boolean);
  const formatShort = (d) => `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 3).toLowerCase()}`;
  const generatedFromPlan = data.shoppingList.some((s) => s.source === "plan");

  const checkedCount = data.shoppingList.filter((s) => s.coche).length;
  const total = data.shoppingList.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const grouped = {};
  data.shoppingList.forEach((s) => {
    const cat = guessCategory(ingredientName(data, s.ingredient_id));
    (grouped[cat] = grouped[cat] || []).push(s);
  });
  const categoriesPresent = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div>
      <div className="mp-header">
        <div>
          <div className="mp-eyebrow">Liste de courses</div>
          <h1 className="mp-serif mp-title">Panier</h1>
        </div>
        {data.shoppingList.length > 0 && <button className="mp-btn mp-btn-ghost" onClick={clearShoppingList}><Trash2 size={14} /> Vider</button>}
      </div>
      {showAddItem && <AddShoppingItemModal data={data} onClose={() => setShowAddItem(false)} onAdd={addManualShoppingItem} />}

      {generatedFromPlan && weekPlanRecipes.length > 0 && (
        <div className="mp-card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Sparkles size={13} color="var(--sage-deep)" />
            <span className="mp-eyebrow">Générée automatiquement</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 14 }}>
            Cette liste combine les ingrédients des <b>{weekPlanRecipes.length} recette{weekPlanRecipes.length !== 1 ? "s" : ""} de votre planning</b> de la semaine.
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex" }}>
              {weekPlanRecipes.slice(0, 5).map((r, i) => (
                <RecipeThumb key={r.id} recipe={r} className="mp-mini-thumb" style={{ marginLeft: i > 0 ? -10 : 0, zIndex: 5 - i }} />
              ))}
            </div>
            {goToPlanning && (
              <button className="mp-btn mp-btn-ghost" style={{ color: "var(--sage-deep)", fontWeight: 700, padding: "4px 2px", flexShrink: 0 }} onClick={goToPlanning}>
                Gérer le planning <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {total > 0 && (
        <div className="mp-progress-card" style={{ marginBottom: 18 }}>
          <div className="mp-progress-label">Progression</div>
          <div className="mp-progress-row">
            <span className="mp-progress-count">{checkedCount} / {total}</span>
            <span className="mp-progress-pct">{pct}%</span>
          </div>
          <div className="mp-progress-track"><div className="mp-progress-fill" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      <div className="mp-cal-nav" style={{ marginBottom: 12 }}>
        <button className="mp-round-btn" style={{ width: 32, height: 32 }} onClick={() => setWeekStart(isoDate(addDays(weekStartDate, -7)))}><ChevronLeft size={15} /></button>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Semaine du {formatShort(weekStartDate)} au {formatShort(weekEndDate)}</span>
        <button className="mp-round-btn" style={{ width: 32, height: 32 }} onClick={() => setWeekStart(isoDate(addDays(weekStartDate, 7)))}><ChevronRight size={15} /></button>
      </div>

      <button className="mp-btn mp-btn-sage" style={{ color: "#fff", marginBottom: 20 }} onClick={() => generateShoppingList(weekStart)} disabled={weekPlanCount === 0}>
        <RotateCcw size={14} /> Générer depuis cette semaine ({weekPlanCount} recette{weekPlanCount !== 1 ? "s" : ""} planifiée{weekPlanCount !== 1 ? "s" : ""})
      </button>

      {data.shoppingList.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={32} />}
          title="Liste vide"
          body={weekPlanCount === 0 ? "Planifie des recettes sur cette semaine, ou ajoute un article directement." : "Clique sur « Générer depuis cette semaine » pour construire ta liste."} />
      ) : (
        categoriesPresent.map((cat) => (
          <div key={cat}>
            <div className="mp-shop-section-title">
              {cat} <span className="mp-shop-section-count">{grouped[cat].length}</span>
            </div>
            <div className="mp-card" style={{ padding: 0 }}>
              {grouped[cat]
                .sort((a, b) => ingredientName(data, a.ingredient_id).localeCompare(ingredientName(data, b.ingredient_id)))
                .map((s) => (
                  <div key={s.id} className="mp-shop-item">
                    <div className={`mp-shop-check-round ${s.coche ? "checked" : ""}`} onClick={() => toggleShoppingItem(s.id)}>
                      {s.coche && <Check size={13} />}
                    </div>
                    <span className={`mp-shop-name ${s.coche ? "checked" : ""}`}>
                      {s.quantite_totale ? `${s.quantite_totale}${s.unite ? ` ${s.unite}` : ""} ` : ""}{ingredientName(data, s.ingredient_id)}
                    </span>
                    <Minus size={14} style={{ cursor: "pointer", color: "var(--ink-faint)", flexShrink: 0 }} onClick={() => removeShoppingItem(s.id)} />
                  </div>
                ))}
            </div>
          </div>
        ))
      )}

      <button className="mp-btn mp-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 18 }} onClick={() => setShowAddItem(true)}>
        <Plus size={14} /> Ajouter un article
      </button>
    </div>
  );
}

const PROFILE_TABS = [
  { id: "regime", label: "Régime" },
  { id: "compte", label: "Compte" },
  { id: "parametres", label: "Paramètres" },
];

function ProfileScreen({ data, update }) {
  const [tab, setTab] = useState("regime");
  const compte = data.userProfile.compte || { nom: "", email: "" };

  const toggleTag = (tagId) => {
    update((d) => {
      const p = d.userProfile.tags_preferences;
      d.userProfile.tags_preferences = p.includes(tagId) ? p.filter((t) => t !== tagId) : [...p, tagId];
      return d;
    });
  };
  const setCompteField = (field, value) => {
    update((d) => {
      if (!d.userProfile.compte) d.userProfile.compte = { nom: "", email: "" };
      d.userProfile.compte[field] = value;
      return d;
    });
  };

  return (
    <div>
      <div className="mp-header">
        <div>
          <h1 className="mp-serif mp-title">Profil</h1>
          <div className="mp-sub">Tes préférences filtrent les recettes proposées dans Découvrir</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: "1px solid var(--line)" }}>
        {PROFILE_TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "8px 4px", marginRight: 18,
              fontSize: 14, fontFamily: "inherit", color: tab === t.id ? "var(--ink)" : "var(--ink-soft)",
              borderBottom: tab === t.id ? "2px solid var(--terracotta)" : "2px solid transparent",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "regime" && (
        <div className="mp-card" style={{ maxWidth: 480 }}>
          <div className="mp-label" style={{ marginBottom: 10 }}>Préférences de régime</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.tags.map((t) => (
              <TagPill key={t.id} selected={data.userProfile.tags_preferences.includes(t.id)} onClick={() => toggleTag(t.id)}>{t.nom}</TagPill>
            ))}
          </div>
        </div>
      )}

      {tab === "compte" && (
        <div className="mp-card" style={{ maxWidth: 480 }}>
          <div className="mp-field">
            <label className="mp-label">Nom</label>
            <input className="mp-input" value={compte.nom} onChange={(e) => setCompteField("nom", e.target.value)} placeholder="Ton nom" />
          </div>
          <div className="mp-field" style={{ marginBottom: 4 }}>
            <label className="mp-label">Email</label>
            <input className="mp-input" type="email" value={compte.email} onChange={(e) => setCompteField("email", e.target.value)} placeholder="ton@email.fr" />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.5 }}>
            Ces informations restent en local sur cet appareil pour l'instant — il n'y a pas encore de connexion en ligne ni de mot de passe. C'est prévu comme base pour un vrai compte plus tard, sans rien casser de ce que tu auras déjà rempli.
          </div>
        </div>
      )}

      {tab === "parametres" && <ParametresPanel data={data} update={update} />}
    </div>
  );
}

function ParametresPanel({ data, update }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const doReset = () => {
    update(() => buildSeedData());
    setConfirmReset(false);
  };
  return (
    <div className="mp-card" style={{ maxWidth: 480 }}>
      <div className="mp-label" style={{ marginBottom: 10 }}>Données</div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.5 }}>
        Tes {data.recipes.length} recettes et {data.ingredients.length} ingrédients sont stockés sur cet appareil.
      </div>
      {confirmReset ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5 }}>Tout remettre à zéro (recettes créées, likes, planning, courses) ?</span>
          <button className="mp-btn mp-btn-danger" onClick={doReset}>Confirmer</button>
          <button className="mp-btn mp-btn-ghost" onClick={() => setConfirmReset(false)}>Annuler</button>
        </div>
      ) : (
        <button className="mp-btn mp-btn-danger" onClick={() => setConfirmReset(true)}><Trash2 size={14} /> Réinitialiser les données</button>
      )}
    </div>
  );
}

/* ---------- Détail recette (lecture seule) ---------- */

function RecipeDetailModal({ recipeId, data, onClose, onEdit, toggleLike }) {
  const r = data.recipes.find((x) => x.id === recipeId);
  if (!r) return null;
  const ingredientLines = ingredientLinesFromRecipe(data, r).split("\n").filter(Boolean);

  return (
    <Modal onClose={onClose}>
      <div style={{ margin: "-18px -16px 16px", position: "relative" }}>
        {r.photo ? (
          <img src={r.photo} alt="" style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "26px 26px 0 0", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: 160, borderRadius: "26px 26px 0 0",
            background: "linear-gradient(135deg, var(--sage), var(--terracotta))",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            fontFamily: "'Fraunces', serif", fontSize: 44,
          }}>
            {r.titre[0]?.toUpperCase()}
          </div>
        )}
        <button className="mp-round-btn" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, background: "rgba(255,255,255,.9)" }} onClick={onClose}><X size={16} /></button>
        <button className="mp-round-btn" style={{ position: "absolute", top: 12, left: 12, width: 34, height: 34, background: r.liked ? "var(--terracotta)" : "rgba(255,255,255,.9)", color: r.liked ? "#fff" : "var(--terracotta)" }}
          onClick={() => toggleLike(r.id)} aria-label="Liker">
          <Heart size={15} fill={r.liked ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="mp-serif" style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px" }}>{r.titre}</p>
      <div className="mp-swipe-meta" style={{ marginBottom: 14 }}>
        {r.temps_preparation ? <span>{r.temps_preparation} min</span> : null}
        {r.difficulte ? <span>{r.difficulte}</span> : null}
        {r.portions ? <span>{r.portions} pers</span> : null}
        {r.prix_estime ? <span>~{r.prix_estime} €</span> : null}
      </div>

      {(r.calories || r.proteines || r.lipides) && (
        <div className="mp-stat-row" style={{ marginBottom: 18 }}>
          {r.calories ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.calories}</div><div className="mp-stat-label">kcal</div></div> : null}
          {r.proteines ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.proteines} g</div><div className="mp-stat-label">Protéines</div></div> : null}
          {r.lipides ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.lipides} g</div><div className="mp-stat-label">Lipides</div></div> : null}
        </div>
      )}

      {r.tag_ids.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {r.tag_ids.map((tid) => <TagPill key={tid}>{tagName(data, tid)}</TagPill>)}
        </div>
      )}

      {ingredientLines.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="mp-label" style={{ marginBottom: 8 }}>Ingrédients</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {ingredientLines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 9, fontSize: 14, alignItems: "flex-start" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terracotta)", flexShrink: 0, marginTop: 7 }} />
                <span>{capitalize(line)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {r.etapes?.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div className="mp-label" style={{ marginBottom: 8 }}>Préparation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {r.etapes.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5 }}>
                <span className="mp-serif" style={{ fontWeight: 600, color: "var(--terracotta)", flexShrink: 0 }}>{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="mp-btn mp-btn-sage" style={{ width: "100%", justifyContent: "center", color: "#fff" }} onClick={() => onEdit(r.id)}>
        <Pencil size={14} /> Modifier la recette
      </button>
    </Modal>
  );
}

/* ---------- Modale recette (édition) ---------- */

function RecipeModal({ recipeModal, data, update, setRecipeModal, deleteRecipe }) {
  const isNew = recipeModal === "new";
  const original = isNew ? null : data.recipes.find((r) => r.id === recipeModal);
  const [form, setForm] = useState(() => original ? structuredClone(original) : {
    id: uid("rec"), titre: "", photo: null, etapes: [], temps_preparation: "", difficulte: "",
    prix_estime: "", portions: 4, calories: "", proteines: "", lipides: "",
    origine: "utilisateur", liked: false, ingredients: [], tag_ids: [],
  });
  const [ingredientsText, setIngredientsText] = useState(() => ingredientLinesFromRecipe(data, original || form));
  const [etapesText, setEtapesText] = useState(() => (original ? original.etapes : []).join("\n"));
  const [showMoreOptions, setShowMoreOptions] = useState(!!(original && (original.difficulte || original.prix_estime || original.tag_ids?.length)));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoDraft, setPhotoDraft] = useState(form.photo && !form.photo.startsWith("data:") ? form.photo : "");
  const [photoError, setPhotoError] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);

  const applyPhoto = () => { setForm((f) => ({ ...f, photo: photoDraft.trim() || null })); setPhotoError(false); };

  // Import d'un fichier local : redimensionné et compressé en JPEG avant stockage,
  // pour rester léger (~quelques dizaines de Ko) — pas de lien externe cassable.
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 640;
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else if (height >= width && height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        setForm((f) => ({ ...f, photo: dataUrl }));
        setPhotoDraft(""); setPhotoError(false); setPhotoBusy(false);
      };
      img.onerror = () => setPhotoBusy(false);
      img.src = reader.result;
    };
    reader.onerror = () => setPhotoBusy(false);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!form.titre.trim()) return;
    update((d) => {
      // Chaque ligne de texte libre ("2 tomates", "500 g raviolis frais") est reliée
      // (ou créée) à un ingrédient normalisé de la bibliothèque, pour que la liste de
      // courses puisse continuer à agréger les quantités par ingrédient.
      const resolvedIngredients = parseIngredientsText(ingredientsText).map(({ nom, quantite, unite }) => {
        const ing = getOrCreateIngredientByName(d, nom, unite);
        return { ingredient_id: ing.id, quantite, unite };
      });
      const etapes = etapesText.split("\n").map((s) => s.trim()).filter(Boolean);
      const finalRecipe = { ...form, ingredients: resolvedIngredients, etapes };
      const idx = d.recipes.findIndex((r) => r.id === finalRecipe.id);
      if (idx >= 0) d.recipes[idx] = finalRecipe; else d.recipes.push(finalRecipe);
      return d;
    });
    setRecipeModal(null);
  };

  return (
    <Modal onClose={() => setRecipeModal(null)}>
      <div className="mp-modal-head">
        <input className="mp-input mp-serif" style={{ fontSize: 21, border: "none", background: "transparent", padding: "0 0 4px", borderBottom: "1px solid var(--line)", borderRadius: 0 }}
          placeholder="Titre de la recette *" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="mp-round-btn like" style={{ width: 38, height: 38, background: form.liked ? "var(--sage)" : "var(--surface)", color: form.liked ? "#fff" : "var(--sage-deep)" }}
            onClick={() => setForm((f) => ({ ...f, liked: !f.liked }))} title="Liker"><Heart size={17} fill={form.liked ? "currentColor" : "none"} /></button>
          <button className="mp-round-btn" style={{ width: 38, height: 38 }} onClick={() => setRecipeModal(null)}><X size={17} /></button>
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-label">Photo</label>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 10, flexShrink: 0, overflow: "hidden",
            background: "linear-gradient(135deg, var(--sage), var(--terracotta))",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            {form.photo && !photoError
              ? <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setPhotoError(true)} />
              : <ImageIcon size={22} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="mp-input" placeholder="URL d'une image (https://…)" value={photoDraft}
                onChange={(e) => { setPhotoDraft(e.target.value); setPhotoError(false); }} onBlur={applyPhoto} onKeyDown={(e) => e.key === "Enter" && applyPhoto()} />
              {form.photo && (
                <button className="mp-btn mp-btn-ghost" onClick={() => { setForm((f) => ({ ...f, photo: null })); setPhotoDraft(""); setPhotoError(false); }}>Retirer</button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>ou</span>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
              <button className="mp-btn mp-btn-ghost" style={{ fontSize: 12.5, padding: "6px 10px" }} onClick={() => fileInputRef.current?.click()} disabled={photoBusy}>
                {photoBusy ? "Import…" : "Choisir un fichier"}
              </button>
            </div>
          </div>
        </div>
        {photoError && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 5 }}>Cette image ne charge pas — vérifie le lien, ou importe le fichier directement.</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <label className="mp-label">Temps (min)</label>
          <input className="mp-input" type="number" value={form.temps_preparation} onChange={(e) => setForm((f) => ({ ...f, temps_preparation: e.target.value }))} />
        </div>
        <div>
          <label className="mp-label">Portions</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 37 }}>
            <button className="mp-round-btn" style={{ width: 30, height: 30 }}
              onClick={() => setForm((f) => ({ ...f, portions: Math.max(1, (Number(f.portions) || 1) - 1) }))}><Minus size={13} /></button>
            <span className="mp-serif" style={{ fontSize: 16, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{form.portions || 4}</span>
            <button className="mp-round-btn" style={{ width: 30, height: 30 }}
              onClick={() => setForm((f) => ({ ...f, portions: (Number(f.portions) || 1) + 1 }))}><Plus size={13} /></button>
          </div>
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-label">Ingrédients</label>
        <textarea className="mp-textarea" rows={4} placeholder={"2 tomates\n1 citron\nUne poignée d'herbes"}
          value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
        <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>
          Une ligne par ingrédient. Une quantité et une unité en début de ligne sont reconnues automatiquement (ex. "500 g farine").
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-label">Préparation</label>
        <textarea className="mp-textarea" rows={5} placeholder="Décrivez les étapes simplement…"
          value={etapesText} onChange={(e) => setEtapesText(e.target.value)} />
      </div>

      <button className="mp-btn mp-btn-ghost" style={{ marginBottom: 14 }} onClick={() => setShowMoreOptions((s) => !s)}>
        {showMoreOptions ? "Moins d'options" : "Plus d'options"}
      </button>

      {showMoreOptions && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label className="mp-label">Difficulté</label>
              <select className="mp-select" value={form.difficulte} onChange={(e) => setForm((f) => ({ ...f, difficulte: e.target.value }))}>
                <option value="">—</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mp-label">Prix estimé (€)</label>
              <input className="mp-input" type="number" value={form.prix_estime} onChange={(e) => setForm((f) => ({ ...f, prix_estime: e.target.value }))} />
            </div>
          </div>

          <div className="mp-field">
            <label className="mp-label">Valeurs nutritionnelles (par portion, optionnel)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <input className="mp-input" type="number" placeholder="kcal" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} />
              <input className="mp-input" type="number" placeholder="Protéines (g)" value={form.proteines} onChange={(e) => setForm((f) => ({ ...f, proteines: e.target.value }))} />
              <input className="mp-input" type="number" placeholder="Lipides (g)" value={form.lipides} onChange={(e) => setForm((f) => ({ ...f, lipides: e.target.value }))} />
            </div>
          </div>

          <div className="mp-field">
            <label className="mp-label">Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.tags.map((t) => (
                <TagPill key={t.id} selected={form.tag_ids.includes(t.id)}
                  onClick={() => setForm((f) => ({ ...f, tag_ids: f.tag_ids.includes(t.id) ? f.tag_ids.filter((x) => x !== t.id) : [...f.tag_ids, t.id] }))}>
                  {t.nom}
                </TagPill>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        {!isNew ? (
          confirmDelete ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12.5 }}>Supprimer définitivement ?</span>
              <button className="mp-btn mp-btn-danger" onClick={() => { deleteRecipe(form.id); setRecipeModal(null); }}>Confirmer</button>
              <button className="mp-btn mp-btn-ghost" onClick={() => setConfirmDelete(false)}>Annuler</button>
            </div>
          ) : (
            <button className="mp-btn mp-btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Supprimer la recette</button>
          )
        ) : <span />}
        <button className="mp-btn mp-btn-sage" style={{ color: "#fff" }} onClick={handleSave} disabled={!form.titre.trim()}><Sparkles size={15} /> Enregistrer la recette</button>
      </div>
    </Modal>
  );
}

/* ---------- Modale ingrédient ---------- */


/* ----------------------------------------------------------------------
   Composant principal
---------------------------------------------------------------------- */

const STORAGE_KEY = "meal-planner-data-v1";
const NAV_ITEMS = [
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "liked", label: "Recettes", icon: Heart },
  { id: "discover", label: "Swipe", icon: Utensils },
  { id: "shopping", label: "Panier", icon: ShoppingCart },
  { id: "create", label: "Créer", icon: Pencil },
];

export default function MealPlannerApp() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState("discover");
  const [recipeModal, setRecipeModal] = useState(null); // recipe id showing the read-only detail view
  const [editRecipeId, setEditRecipeId] = useState(null); // recipe id currently open in the edit form
  const [discoverFilterTags, setDiscoverFilterTags] = useState([]);
  const [useProfileFilter, setUseProfileFilter] = useState(true);
  const [likedSelection, setLikedSelection] = useState([]);
  const skipNextSave = useRef(true);

  // Chargement initial
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(migrateWeeklyPlan(JSON.parse(raw)));
      } else {
        setData(buildSeedData());
      }
    } catch {
      setData(buildSeedData());
    } finally {
      setLoaded(true);
    }
  }, []);

  // Sauvegarde
  useEffect(() => {
    if (!loaded || !data) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    }, 350);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const update = useCallback((fn) => setData((prev) => fn(structuredClone(prev))), []);

  const toggleLike = useCallback((recipeId) => {
    update((d) => { const r = d.recipes.find((x) => x.id === recipeId); if (r) r.liked = !r.liked; return d; });
  }, [update]);

  const deleteRecipe = useCallback((recipeId) => {
    update((d) => {
      d.recipes = d.recipes.filter((r) => r.id !== recipeId);
      d.weeklyPlan = d.weeklyPlan.filter((p) => p.recipe_id !== recipeId);
      return d;
    });
  }, [update]);

  const addToPlan = useCallback((dateISO, moment, recipeId) => {
    update((d) => {
      d.weeklyPlan = d.weeklyPlan.filter((p) => !(p.date === dateISO && p.moment === moment));
      d.weeklyPlan.push({ id: uid("plan"), date: dateISO, moment, recipe_id: recipeId });
      return d;
    });
  }, [update]);
  const removeFromPlan = useCallback((planId) => {
    update((d) => { d.weeklyPlan = d.weeklyPlan.filter((p) => p.id !== planId); return d; });
  }, [update]);
  const clearWeek = useCallback((weekDatesISO) => {
    update((d) => { d.weeklyPlan = d.weeklyPlan.filter((p) => !weekDatesISO.includes(p.date)); return d; });
  }, [update]);

  // Génère la liste de courses à partir des recettes planifiées sur UNE semaine réelle donnée
  // (du lundi startDateISO au dimanche suivant), puisque le planning couvre désormais toute l'année.
  const generateShoppingList = useCallback((startDateISO) => {
    update((d) => {
      const start = parseISO(startDateISO);
      const end = addDays(start, 6);
      const inRange = d.weeklyPlan.filter((p) => { const pd = parseISO(p.date); return pd >= start && pd <= end; });
      const totals = {};
      inRange.forEach((p) => {
        const recipe = d.recipes.find((r) => r.id === p.recipe_id);
        if (!recipe) return;
        recipe.ingredients.forEach((ri) => {
          if (!totals[ri.ingredient_id]) totals[ri.ingredient_id] = { quantite: 0, unite: ri.unite };
          totals[ri.ingredient_id].quantite += Number(ri.quantite) || 0;
        });
      });
      const previousPlanItems = d.shoppingList.filter((s) => s.source === "plan");
      const prevChecked = Object.fromEntries(previousPlanItems.map((s) => [s.ingredient_id, s.coche]));
      const regenerated = Object.entries(totals).map(([ingredient_id, v]) => ({
        id: uid("shop"), ingredient_id, quantite_totale: v.quantite, unite: v.unite,
        coche: prevChecked[ingredient_id] || false, source: "plan",
      }));
      // On ne remplace que la partie générée depuis le planning — les articles ajoutés
      // manuellement (produits non liés à une recette) restent intacts.
      const manualItems = d.shoppingList.filter((s) => s.source === "manuel");
      d.shoppingList = [...regenerated, ...manualItems];
      return d;
    });
  }, [update]);

  // Ajoute (ou augmente) un article directement dans la liste de courses, sans passer
  // par le planning — utile pour un produit non lié à une recette.
  const addManualShoppingItem = useCallback((nomOuId, quantite, unite) => {
    update((d) => {
      // Si l'appelant passe l'id d'un ingrédient déjà existant (choisi dans les
      // suggestions), on le réutilise tel quel. Sinon (texte libre — ex. "Sopalin",
      // "Dentifrice"), on crée à la volée un nouvel ingrédient normalisé, ce qui
      // permet d'ajouter n'importe quel article, alimentaire ou non, même s'il
      // n'apparaît dans aucune recette.
      const existingIng = d.ingredients.find((i) => i.id === nomOuId);
      const ing = existingIng || getOrCreateIngredientByName(d, nomOuId, unite);
      const existing = d.shoppingList.find((s) => s.ingredient_id === ing.id && s.source === "manuel" && s.unite === unite);
      if (existing) { existing.quantite_totale += quantite; }
      else { d.shoppingList.push({ id: uid("shop"), ingredient_id: ing.id, quantite_totale: quantite, unite, coche: false, source: "manuel" }); }
      return d;
    });
  }, [update]);

  const toggleShoppingItem = useCallback((itemId) => {
    update((d) => { const it = d.shoppingList.find((s) => s.id === itemId); if (it) it.coche = !it.coche; return d; });
  }, [update]);
  const removeShoppingItem = useCallback((itemId) => {
    update((d) => { d.shoppingList = d.shoppingList.filter((s) => s.id !== itemId); return d; });
  }, [update]);
  const clearShoppingList = useCallback(() => update((d) => { d.shoppingList = []; return d; }), [update]);
  const markSeen = useCallback((recipeId) => update((d) => { d.swipeDeckSeenIds = [...(d.swipeDeckSeenIds || []), recipeId]; return d; }), [update]);
  const resetDeck = useCallback(() => update((d) => { d.swipeDeckSeenIds = []; return d; }), [update]);

  if (!loaded || !data) {
    return (
      <div className="mp-phone-page">
        <style>{STYLE}</style>
        <div className="mp-phone-shell">
          <div className="mp-root" style={{ alignItems: "center", justifyContent: "center" }}>
            <div className="mp-serif" style={{ fontSize: 18, color: "#756B58" }}>Chargement du garde-manger…</div>
          </div>
        </div>
      </div>
    );
  }

  const likedRecipes = data.recipes.filter((r) => r.liked);
  const profileTagIds = data.userProfile.tags_preferences;
  const activeFilterTags = useProfileFilter ? profileTagIds : discoverFilterTags;
  const deckRecipes = data.recipes.filter((r) =>
    !r.liked &&
    !(data.swipeDeckSeenIds || []).includes(r.id) &&
    (activeFilterTags.length === 0 || activeFilterTags.every((t) => r.tag_ids.includes(t)))
  );

  const screenProps = {
    discover: { data, deckRecipes, profileTagIds, useProfileFilter, setUseProfileFilter, discoverFilterTags, setDiscoverFilterTags, toggleLike, markSeen, resetDeck, setRecipeModal },
    liked: { data, likedRecipes, likedSelection, setLikedSelection, setRecipeModal, update },
    planning: { data, likedRecipes, addToPlan, removeFromPlan, clearWeek, generateShoppingList, setRecipeModal },
    shopping: { data, generateShoppingList, toggleShoppingItem, clearShoppingList, addManualShoppingItem, removeShoppingItem, goToPlanning: () => setScreen("planning") },
    create: { data, update },
    profile: { data, update },
  };

  const ScreenComponents = { discover: DiscoverScreen, liked: LikedScreen, planning: PlanningScreen, shopping: ShoppingScreen, create: CreateScreen, profile: ProfileScreen };
  const ActiveScreen = ScreenComponents[screen];

  return (
    <div className="mp-phone-page">
      <style>{STYLE}</style>
      <div className="mp-phone-shell">
        <div className="mp-root">
          <main className="mp-main">
            <div className="mp-topbar">
              <button className={`mp-round-btn ${screen === "profile" ? "mp-profile-active" : ""}`} onClick={() => setScreen("profile")} aria-label="Profil">
                <User size={17} />
              </button>
            </div>
            <ActiveScreen {...screenProps[screen]} />
          </main>
          <nav className="mp-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCenter = item.id === "discover";
              return (
                <button key={item.id} className={`mp-nav-btn ${isCenter ? "center" : ""} ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
                  <span className="mp-nav-icon-wrap"><Icon size={isCenter ? 20 : 19} /></span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          {recipeModal && !editRecipeId && (
            <RecipeDetailModal recipeId={recipeModal} data={data} onClose={() => setRecipeModal(null)}
              onEdit={(id) => setEditRecipeId(id)} toggleLike={toggleLike} />
          )}
          {editRecipeId && (
            <RecipeModal recipeModal={editRecipeId} data={data} update={update}
              setRecipeModal={() => { setEditRecipeId(null); setRecipeModal(null); }} deleteRecipe={deleteRecipe} />
          )}
        </div>
      </div>
    </div>
  );
}
