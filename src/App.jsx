import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, X, Info, ChevronLeft, ChevronRight, Plus, Trash2, Check,
  Pencil, ShoppingCart, CalendarDays, BookOpen, Sparkles, User,
  Search, ArrowLeft, RotateCcw, Minus, Image as ImageIcon, Menu, Utensils,
  SlidersHorizontal, Download, Upload
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
const getInitials = (nom) => (nom || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

const ESSENTIAL_SEED = ["Papier toilette", "Sopalin", "Dentifrice", "Liquide vaisselle", "Lessive", "Litière", "Mouchoirs"];

const SEED_RECIPES = [
  {
    titre: "Raviolis, crème, jambon, beurre",
    photo: "/recipes/raviolis-creme-jambon-beurre.jpg",
    temps_preparation: 10, difficulte: "facile", prix_estime: 4,
    description: "Raviolis frais, crème onctueuse et jambon doré au beurre.",
    calories: 610, proteines: 22, lipides: 28,
    tags: ["rapide", "économique"],
    etapes: ["Faire chauffer une noix de beurre dans une poêle.", "Ajouter les raviolis et un fond d'eau, couvrir 5 min.", "Ajouter la crème et le jambon coupé en lanières, mélanger 2 min à feu doux."],
    ingredients: [{ nom: "raviolis frais", quantite: 500, unite: "g" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }, { nom: "jambon blanc", quantite: 2, unite: "pièce" }, { nom: "beurre", quantite: 20, unite: "g" }],
  },
  {
    titre: "Pâtes à la carbonara",
    photo: "/recipes/pates-carbonara.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 6,
    description: "Spaghetti, lardons croustillants et sauce onctueuse aux œufs.",
    calories: 640, proteines: 26, lipides: 30,
    tags: ["rapide"],
    etapes: ["Cuire les pâtes dans l'eau bouillante salée.", "Faire revenir les lardons à sec.", "Mélanger œufs, parmesan et poivre dans un bol.", "Égoutter les pâtes, mélanger hors du feu avec les lardons puis l'appareil œufs-parmesan."],
    ingredients: [{ nom: "spaghetti", quantite: 400, unite: "g" }, { nom: "lardons", quantite: 200, unite: "g" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "parmesan", quantite: 60, unite: "g" }, { nom: "poivre", quantite: 1, unite: "pincée" }],
  },
  {
    titre: "Curry de pois chiches",
    photo: "/recipes/curry-pois-chiches.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 5,
    description: "Pois chiches mijotés dans une sauce tomate-coco épicée.",
    calories: 420, proteines: 14, lipides: 18,
    tags: ["végan", "économique", "sans gluten"],
    etapes: ["Faire revenir oignon et ail dans l'huile.", "Ajouter les épices puis les tomates concassées, laisser réduire 5 min.", "Ajouter les pois chiches et le lait de coco, mijoter 15 min."],
    ingredients: [{ nom: "pois chiches cuits", quantite: 400, unite: "g" }, { nom: "lait de coco", quantite: 400, unite: "ml" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "ail", quantite: 2, unite: "pièce" }, { nom: "curry en poudre", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Poulet rôti aux herbes",
    photo: "/recipes/poulet-roti-herbes.jpg",
    temps_preparation: 90, difficulte: "moyen", prix_estime: 12,
    description: "Poulet entier doré au four, thym et ail.",
    calories: 520, proteines: 42, lipides: 32,
    tags: ["riche en protéines", "hiver"],
    etapes: ["Préchauffer le four à 200°C.", "Frotter le poulet avec beurre, thym et ail.", "Enfourner 1h15 en arrosant régulièrement."],
    ingredients: [{ nom: "poulet entier", quantite: 1, unite: "pièce" }, { nom: "beurre", quantite: 40, unite: "g" }, { nom: "thym", quantite: 1, unite: "cuillère à café" }, { nom: "ail", quantite: 3, unite: "pièce" }],
  },
  {
    titre: "Salade de lentilles, feta, tomates",
    photo: "/recipes/salade-lentilles-feta-tomates.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 5,
    description: "Lentilles, feta et tomates fraîches, filet d'huile d'olive.",
    calories: 380, proteines: 18, lipides: 20,
    tags: ["végétarien", "été", "rapide"],
    etapes: ["Rincer les lentilles cuites.", "Couper tomates et feta en dés.", "Mélanger le tout avec un filet d'huile d'olive et du vinaigre."],
    ingredients: [{ nom: "lentilles cuites", quantite: 300, unite: "g" }, { nom: "feta", quantite: 100, unite: "g" }, { nom: "tomate", quantite: 3, unite: "pièce" }, { nom: "huile d'olive", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Risotto aux champignons",
    photo: "/recipes/risotto-champignons.jpg",
    temps_preparation: 35, difficulte: "moyen", prix_estime: 7,
    description: "Riz crémeux aux champignons de Paris et parmesan.",
    calories: 480, proteines: 12, lipides: 16,
    tags: ["végétarien"],
    etapes: ["Faire revenir l'oignon émincé dans du beurre.", "Ajouter le riz, nacrer 2 min.", "Verser le bouillon louche par louche en remuant jusqu'à absorption complète, 20 min.", "Ajouter les champignons poêlés et le parmesan hors du feu."],
    ingredients: [{ nom: "riz arborio", quantite: 300, unite: "g" }, { nom: "champignons de paris", quantite: 250, unite: "g" }, { nom: "bouillon de légumes", quantite: 1, unite: "l" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "parmesan", quantite: 50, unite: "g" }, { nom: "beurre", quantite: 30, unite: "g" }],
  },
  {
    titre: "Omelette aux fines herbes",
    photo: "/recipes/omelette-fines-herbes.jpg",
    temps_preparation: 10, difficulte: "facile", prix_estime: 2,
    description: "Œufs battus aux herbes fraîches, cuits à la poêle.",
    calories: 310, proteines: 20, lipides: 24,
    tags: ["rapide", "économique", "végétarien"],
    etapes: ["Battre les œufs avec sel, poivre et herbes.", "Cuire dans une poêle beurrée à feu moyen, plier en deux."],
    ingredients: [{ nom: "œuf", quantite: 4, unite: "pièce" }, { nom: "ciboulette", quantite: 1, unite: "cuillère à soupe" }, { nom: "beurre", quantite: 10, unite: "g" }],
  },
  {
    titre: "Chili sin carne",
    photo: "/recipes/chili-sin-carne.jpg",
    temps_preparation: 40, difficulte: "moyen", prix_estime: 5,
    description: "Haricots rouges, maïs et poivrons mijotés aux épices.",
    calories: 390, proteines: 16, lipides: 8,
    tags: ["végan", "économique", "hiver"],
    etapes: ["Faire revenir oignon, poivron et ail.", "Ajouter tomates concassées, haricots rouges, maïs et épices.", "Laisser mijoter 25 min à couvert."],
    ingredients: [{ nom: "haricots rouges cuits", quantite: 400, unite: "g" }, { nom: "maïs", quantite: 200, unite: "g" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "piment doux", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Saumon, riz, brocolis",
    photo: "/recipes/saumon-riz-brocolis.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 9,
    description: "Pavé de saumon poêlé, riz basmati et brocolis vapeur.",
    calories: 520, proteines: 34, lipides: 22,
    tags: ["riche en protéines", "sans gluten"],
    etapes: ["Cuire le riz.", "Cuire le saumon à la poêle 4 min de chaque côté.", "Cuire les brocolis à la vapeur 8 min."],
    ingredients: [{ nom: "pavé de saumon", quantite: 2, unite: "pièce" }, { nom: "riz basmati", quantite: 150, unite: "g" }, { nom: "brocoli", quantite: 300, unite: "g" }],
  },
  {
    titre: "Soupe potiron-châtaigne",
    photo: "/recipes/soupe-potiron-chataigne.jpg",
    temps_preparation: 35, difficulte: "facile", prix_estime: 4,
    description: "Velouté de potiron et châtaignes, tout en douceur.",
    calories: 240, proteines: 6, lipides: 6,
    tags: ["végan", "hiver", "économique", "sans gluten"],
    etapes: ["Faire revenir l'oignon.", "Ajouter le potiron coupé et les châtaignes, couvrir d'eau.", "Cuire 25 min puis mixer."],
    ingredients: [{ nom: "potiron", quantite: 800, unite: "g" }, { nom: "châtaignes cuites", quantite: 200, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Tartines avocat, œuf poché",
    photo: "/recipes/tartines-avocat-oeuf-poche.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 4,
    description: "Pain grillé, avocat écrasé et œuf poché coulant.",
    calories: 350, proteines: 14, lipides: 20,
    tags: ["végétarien", "rapide"],
    etapes: ["Griller le pain.", "Écraser l'avocat avec citron, sel, poivre sur les tartines.", "Pocher les œufs 3 min dans l'eau frémissante vinaigrée, déposer sur les tartines."],
    ingredients: [{ nom: "pain de campagne", quantite: 4, unite: "pièce" }, { nom: "avocat", quantite: 2, unite: "pièce" }, { nom: "œuf", quantite: 2, unite: "pièce" }, { nom: "citron", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Tajine de légumes",
    photo: "/recipes/tajine-legumes.jpg",
    temps_preparation: 50, difficulte: "moyen", prix_estime: 6,
    description: "Carottes, courgettes et pois chiches mijotés aux épices douces.",
    calories: 340, proteines: 12, lipides: 10,
    tags: ["végan", "sans gluten", "hiver"],
    etapes: ["Faire revenir oignon et épices.", "Ajouter carottes, courgettes, pois chiches et un peu d'eau.", "Mijoter 35 min à couvert."],
    ingredients: [{ nom: "carotte", quantite: 3, unite: "pièce" }, { nom: "courgette", quantite: 2, unite: "pièce" }, { nom: "pois chiches cuits", quantite: 300, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "cumin", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Gratin dauphinois",
    photo: "/recipes/gratin-dauphinois.jpg",
    temps_preparation: 75, difficulte: "moyen", prix_estime: 4,
    description: "Pommes de terre fondantes, crème et une pointe d'ail.",
    calories: 430, proteines: 8, lipides: 24,
    tags: ["végétarien", "hiver", "économique"],
    etapes: ["Préchauffer le four à 180°C.", "Couper les pommes de terre en fines rondelles.", "Disposer en couches dans un plat avec crème, lait, ail et muscade.", "Cuire 1h15."],
    ingredients: [{ nom: "pomme de terre", quantite: 1, unite: "kg" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }, { nom: "lait", quantite: 20, unite: "cl" }, { nom: "ail", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Poke bowl thon-mangue",
    photo: "/recipes/poke-bowl-thon-mangue.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 8,
    description: "Thon frais, mangue et riz vinaigré, frais et coloré.",
    calories: 480, proteines: 28, lipides: 12,
    tags: ["été", "riche en protéines", "sans gluten"],
    etapes: ["Cuire le riz vinaigré.", "Couper thon, mangue et concombre en dés.", "Dresser le bol et ajouter sésame et sauce soja."],
    ingredients: [{ nom: "thon frais", quantite: 200, unite: "g" }, { nom: "riz à sushi", quantite: 150, unite: "g" }, { nom: "mangue", quantite: 1, unite: "pièce" }, { nom: "concombre", quantite: 1, unite: "pièce" }, { nom: "graines de sésame", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Pancakes moelleux",
    photo: "/recipes/pancakes-moelleux.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 3,
    description: "Petites crêpes épaisses et moelleuses, à garnir à l'envi.",
    calories: 380, proteines: 10, lipides: 14,
    tags: ["sucré", "économique"],
    etapes: ["Mélanger farine, levure, sucre et sel.", "Ajouter œuf, lait et beurre fondu, fouetter.", "Cuire des petites louches à la poêle 2 min de chaque côté."],
    ingredients: [{ nom: "farine", quantite: 250, unite: "g" }, { nom: "lait", quantite: 30, unite: "cl" }, { nom: "œuf", quantite: 2, unite: "pièce" }, { nom: "sucre", quantite: 2, unite: "cuillère à soupe" }, { nom: "levure chimique", quantite: 1, unite: "cuillère à café" }, { nom: "beurre", quantite: 30, unite: "g" }],
  },
  {
    titre: "Quiche lorraine",
    photo: "/recipes/quiche-lorraine.jpg",
    temps_preparation: 50, difficulte: "moyen", prix_estime: 5,
    description: "Pâte croustillante, lardons et appareil œufs-crème.",
    calories: 460, proteines: 16, lipides: 30,
    tags: ["économique"],
    etapes: ["Préchauffer le four à 190°C.", "Foncer un moule avec la pâte.", "Mélanger œufs, crème, lardons, verser sur la pâte.", "Cuire 35 min."],
    ingredients: [{ nom: "pâte brisée", quantite: 1, unite: "pièce" }, { nom: "lardons", quantite: 200, unite: "g" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "crème fraîche", quantite: 20, unite: "cl" }],
  },
  {
    titre: "Bowl quinoa, légumes rôtis, houmous",
    photo: "/recipes/bowl-quinoa-legumes-rotis-houmous.jpg",
    temps_preparation: 35, difficulte: "facile", prix_estime: 6,
    description: "Quinoa, légumes rôtis et houmous crémeux.",
    calories: 410, proteines: 14, lipides: 16,
    tags: ["végan", "sans gluten", "riche en protéines"],
    etapes: ["Cuire le quinoa.", "Rôtir les légumes coupés 25 min à 200°C avec huile d'olive.", "Dresser le bol avec le houmous."],
    ingredients: [{ nom: "quinoa", quantite: 150, unite: "g" }, { nom: "courgette", quantite: 1, unite: "pièce" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "houmous", quantite: 100, unite: "g" }, { nom: "huile d'olive", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Croque-monsieur",
    photo: "/recipes/croque-monsieur.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 3,
    description: "Jambon et gruyère fondant entre deux tranches dorées.",
    calories: 450, proteines: 22, lipides: 24,
    tags: ["rapide", "économique"],
    etapes: ["Tartiner le pain de béchamel.", "Garnir de jambon et de gruyère râpé.", "Passer au four ou à la poêle jusqu'à ce que ce soit doré."],
    ingredients: [{ nom: "pain de mie", quantite: 4, unite: "pièce" }, { nom: "jambon blanc", quantite: 2, unite: "pièce" }, { nom: "gruyère râpé", quantite: 100, unite: "g" }, { nom: "béchamel", quantite: 100, unite: "g" }],
  },
  {
    titre: "Pad thaï au poulet",
    photo: "/recipes/pad-thai-poulet.jpg",
    temps_preparation: 30, difficulte: "moyen", prix_estime: 7,
    description: "Nouilles sautées, poulet, cacahuètes et sauce sucrée-salée.",
    calories: 560, proteines: 30, lipides: 18,
    tags: ["riche en protéines"],
    etapes: ["Faire tremper les nouilles de riz dans l'eau chaude.", "Faire sauter le poulet coupé en lanières.", "Ajouter les nouilles, la sauce pad thaï et les œufs battus, mélanger 2 min.", "Parsemer de cacahuètes concassées et de citron vert."],
    ingredients: [{ nom: "nouilles de riz", quantite: 200, unite: "g" }, { nom: "blanc de poulet", quantite: 300, unite: "g" }, { nom: "œuf", quantite: 2, unite: "pièce" }, { nom: "cacahuètes", quantite: 40, unite: "g" }, { nom: "sauce pad thaï", quantite: 3, unite: "cuillère à soupe" }, { nom: "citron vert", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Wraps au poulet croustillant",
    photo: "/recipes/wraps-poulet-croustillant.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 6,
    description: "Poulet pané croustillant, crudités et sauce dans une tortilla moelleuse.",
    calories: 520, proteines: 28, lipides: 20,
    tags: ["rapide"],
    etapes: ["Paner les aiguillettes de poulet et les cuire à la poêle jusqu'à ce qu'elles soient dorées.", "Couper la salade, la tomate et l'oignon rouge.", "Garnir les tortillas de poulet, crudités et sauce, puis rouler."],
    ingredients: [{ nom: "aiguillettes de poulet", quantite: 400, unite: "g" }, { nom: "tortilla de blé", quantite: 4, unite: "pièce" }, { nom: "salade", quantite: 1, unite: "pièce" }, { nom: "tomate", quantite: 2, unite: "pièce" }, { nom: "sauce fromagère", quantite: 3, unite: "cuillère à soupe" }],
  },
  {
    titre: "Ratatouille",
    photo: "/recipes/ratatouille.jpg",
    temps_preparation: 45, difficulte: "facile", prix_estime: 6,
    description: "Aubergines, courgettes, poivrons et tomates mijotés aux herbes de Provence.",
    calories: 220, proteines: 5, lipides: 9,
    tags: ["végan", "été", "sans gluten", "économique"],
    etapes: ["Couper tous les légumes en dés.", "Faire revenir l'oignon et l'ail dans l'huile d'olive.", "Ajouter les légumes et les herbes de Provence, laisser mijoter 35 min à couvert en remuant de temps en temps."],
    ingredients: [{ nom: "aubergine", quantite: 2, unite: "pièce" }, { nom: "courgette", quantite: 2, unite: "pièce" }, { nom: "poivron", quantite: 2, unite: "pièce" }, { nom: "tomate", quantite: 4, unite: "pièce" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "ail", quantite: 2, unite: "pièce" }, { nom: "herbes de provence", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Soupe miso",
    photo: "/recipes/soupe-miso.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 4,
    description: "Bouillon miso, tofu soyeux, algues wakamé et oignon nouveau.",
    calories: 140, proteines: 9, lipides: 5,
    tags: ["végétarien", "rapide", "sans gluten"],
    etapes: ["Faire chauffer le bouillon dashi sans le laisser bouillir.", "Diluer la pâte miso dans un peu de bouillon puis reverser dans la casserole.", "Ajouter le tofu en dés et les algues wakamé réhydratées.", "Parsemer d'oignon nouveau émincé avant de servir."],
    ingredients: [{ nom: "pâte miso", quantite: 3, unite: "cuillère à soupe" }, { nom: "tofu soyeux", quantite: 150, unite: "g" }, { nom: "algues wakamé", quantite: 10, unite: "g" }, { nom: "oignon nouveau", quantite: 1, unite: "pièce" }, { nom: "bouillon dashi", quantite: 1, unite: "l" }],
  },
  {
    titre: "Bœuf bourguignon",
    photo: "/recipes/boeuf-bourguignon.jpg",
    temps_preparation: 150, difficulte: "difficile", prix_estime: 14,
    description: "Bœuf mijoté longuement au vin rouge, carottes et champignons.",
    calories: 480, proteines: 38, lipides: 24,
    tags: ["hiver", "riche en protéines"],
    etapes: ["Faire dorer les morceaux de bœuf dans une cocotte.", "Ajouter les lardons, oignons et carottes, faire revenir 5 min.", "Saupoudrer de farine, mouiller avec le vin rouge, ajouter le bouquet garni.", "Laisser mijoter à couvert 2h à feu doux, ajouter les champignons 20 min avant la fin."],
    ingredients: [{ nom: "bœuf à bourguignon", quantite: 800, unite: "g" }, { nom: "carotte", quantite: 4, unite: "pièce" }, { nom: "champignon de paris", quantite: 250, unite: "g" }, { nom: "lardons", quantite: 150, unite: "g" }, { nom: "oignon", quantite: 2, unite: "pièce" }, { nom: "vin rouge", quantite: 75, unite: "cl" }, { nom: "farine", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Falafels maison",
    photo: "/recipes/falafels-maison.jpg",
    temps_preparation: 40, difficulte: "moyen", prix_estime: 5,
    description: "Boulettes de pois chiches épicées, croustillantes à l'extérieur, moelleuses à l'intérieur.",
    calories: 380, proteines: 14, lipides: 16,
    tags: ["végan", "économique"],
    etapes: ["Mixer les pois chiches trempés (non cuits) avec oignon, ail, persil et épices.", "Former des boulettes et laisser reposer 30 min au frais.", "Faire frire ou cuire au four jusqu'à ce qu'elles soient dorées et croustillantes."],
    ingredients: [{ nom: "pois chiches secs", quantite: 250, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "ail", quantite: 2, unite: "pièce" }, { nom: "persil", quantite: 1, unite: "botte" }, { nom: "cumin", quantite: 1, unite: "cuillère à café" }, { nom: "coriandre en poudre", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Tiramisu",
    photo: "/recipes/tiramisu.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 6,
    description: "Biscuits café, crème mascarpone légère et cacao amer.",
    calories: 420, proteines: 7, lipides: 26,
    tags: ["sucré"],
    etapes: ["Séparer les blancs des jaunes d'œufs, fouetter les jaunes avec le sucre puis incorporer le mascarpone.", "Monter les blancs en neige et les incorporer délicatement.", "Tremper rapidement les biscuits dans le café et les disposer dans un plat, alterner avec la crème.", "Réserver au frais au moins 4h, saupoudrer de cacao avant de servir."],
    ingredients: [{ nom: "biscuits cuillère", quantite: 24, unite: "pièce" }, { nom: "mascarpone", quantite: 250, unite: "g" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "sucre", quantite: 80, unite: "g" }, { nom: "café fort", quantite: 25, unite: "cl" }, { nom: "cacao en poudre", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Buddha bowl saumon avocat",
    photo: "/recipes/buddha-bowl-saumon-avocat.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 10,
    description: "Saumon mariné, avocat, edamame et riz vinaigré dans un bol coloré.",
    calories: 540, proteines: 32, lipides: 26,
    tags: ["riche en protéines", "sans gluten", "été"],
    etapes: ["Cuire le riz et le vinaigrer légèrement.", "Mariner le saumon coupé en cubes avec sauce soja et sésame.", "Cuire les edamame quelques minutes à l'eau bouillante.", "Dresser le bol avec riz, saumon, avocat tranché et edamame."],
    ingredients: [{ nom: "pavé de saumon", quantite: 300, unite: "g" }, { nom: "riz à sushi", quantite: 200, unite: "g" }, { nom: "avocat", quantite: 1, unite: "pièce" }, { nom: "edamame", quantite: 150, unite: "g" }, { nom: "sauce soja", quantite: 2, unite: "cuillère à soupe" }, { nom: "graines de sésame", quantite: 1, unite: "cuillère à soupe" }],
  },
  {
    titre: "Tacos au bœuf épicé",
    photo: "/recipes/tacos-boeuf-epice.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 7,
    description: "Bœuf haché épicé, crudités croquantes et tortillas grillées.",
    calories: 490, proteines: 26, lipides: 22,
    tags: ["rapide", "épicé"],
    etapes: ["Faire revenir le bœuf haché avec l'oignon et les épices à tacos.", "Réchauffer les tortillas à la poêle.", "Garnir de viande, salade, tomate, fromage râpé et sauce.", "Servir avec des quartiers de citron vert."],
    ingredients: [{ nom: "bœuf haché", quantite: 400, unite: "g" }, { nom: "tortilla de maïs", quantite: 8, unite: "pièce" }, { nom: "tomate", quantite: 2, unite: "pièce" }, { nom: "salade", quantite: 1, unite: "pièce" }, { nom: "fromage râpé", quantite: 80, unite: "g" }, { nom: "épices à tacos", quantite: 1, unite: "sachet" }],
  },
  {
    titre: "Poulet tikka masala",
    photo: "/recipes/poulet-tikka-masala.jpg",
    temps_preparation: 40, difficulte: "moyen", prix_estime: 8,
    description: "Poulet mariné au yaourt et aux épices, sauce tomate crémeuse.",
    calories: 460, proteines: 34, lipides: 22,
    tags: ["riche en protéines", "épicé"],
    etapes: ["Mariner le poulet coupé en cubes dans le yaourt et les épices tikka au moins 1h.", "Faire dorer le poulet mariné à la poêle.", "Ajouter l'oignon, l'ail, le concentré de tomate et la crème, laisser mijoter 15 min.", "Servir avec du riz basmati."],
    ingredients: [{ nom: "blanc de poulet", quantite: 500, unite: "g" }, { nom: "yaourt nature", quantite: 100, unite: "g" }, { nom: "épices tikka masala", quantite: 2, unite: "cuillère à soupe" }, { nom: "crème fraîche", quantite: 15, unite: "cl" }, { nom: "concentré de tomate", quantite: 2, unite: "cuillère à soupe" }, { nom: "riz basmati", quantite: 200, unite: "g" }],
  },
  {
    titre: "Lasagnes bolognaise",
    photo: "/recipes/lasagnes-bolognaise.jpg",
    temps_preparation: 70, difficulte: "moyen", prix_estime: 8,
    description: "Couches de pâtes, sauce bolognaise mijotée et béchamel gratinée.",
    calories: 560, proteines: 28, lipides: 26,
    tags: ["hiver"],
    etapes: ["Préparer une sauce bolognaise en faisant mijoter bœuf haché, oignon, ail et tomates concassées 30 min.", "Préchauffer le four à 200°C.", "Alterner dans un plat les feuilles de lasagne, la bolognaise et la béchamel.", "Terminer par du fromage râpé et enfourner 30 min."],
    ingredients: [{ nom: "feuilles de lasagne", quantite: 250, unite: "g" }, { nom: "bœuf haché", quantite: 400, unite: "g" }, { nom: "tomates concassées", quantite: 800, unite: "g" }, { nom: "béchamel", quantite: 400, unite: "g" }, { nom: "fromage râpé", quantite: 120, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Maki concombre-avocat",
    photo: "/recipes/maki-concombre-avocat.jpg",
    temps_preparation: 40, difficulte: "moyen", prix_estime: 6,
    description: "Rouleaux de riz vinaigré, concombre et avocat, servis avec sauce soja.",
    calories: 320, proteines: 6, lipides: 8,
    tags: ["végan", "été", "sans gluten"],
    etapes: ["Cuire le riz à sushi et le vinaigrer.", "Couper le concombre et l'avocat en bâtonnets.", "Étaler le riz sur une feuille de nori, garnir et rouler serré à l'aide d'une natte.", "Couper en tronçons et servir avec sauce soja et wasabi."],
    ingredients: [{ nom: "riz à sushi", quantite: 300, unite: "g" }, { nom: "feuille de nori", quantite: 6, unite: "pièce" }, { nom: "concombre", quantite: 1, unite: "pièce" }, { nom: "avocat", quantite: 2, unite: "pièce" }, { nom: "sauce soja", quantite: 3, unite: "cuillère à soupe" }, { nom: "vinaigre de riz", quantite: 3, unite: "cuillère à soupe" }],
  },
  {
    titre: "Houmous et pain pita",
    photo: "/recipes/houmous-pain-pita.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 4,
    description: "Houmous maison crémeux au tahini, pain pita grillé.",
    calories: 310, proteines: 10, lipides: 16,
    tags: ["végan", "rapide", "économique"],
    etapes: ["Mixer les pois chiches avec le tahini, le jus de citron, l'ail et un filet d'huile d'olive.", "Rectifier l'assaisonnement et ajouter un peu d'eau si trop épais.", "Griller les pains pita et les couper en triangles.", "Servir le houmous avec un filet d'huile d'olive et de paprika."],
    ingredients: [{ nom: "pois chiches cuits", quantite: 400, unite: "g" }, { nom: "tahini", quantite: 2, unite: "cuillère à soupe" }, { nom: "citron", quantite: 1, unite: "pièce" }, { nom: "ail", quantite: 1, unite: "pièce" }, { nom: "pain pita", quantite: 4, unite: "pièce" }, { nom: "huile d'olive", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Galette bretonne jambon-fromage",
    photo: "/recipes/galette-bretonne.jpg",
    temps_preparation: 30, difficulte: "moyen", prix_estime: 5,
    description: "Galette de sarrasin garnie de jambon, fromage et œuf.",
    calories: 420, proteines: 20, lipides: 18,
    tags: ["économique"],
    etapes: ["Préparer la pâte à galette avec la farine de sarrasin, l'eau et le sel, laisser reposer 30 min.", "Cuire les galettes à la poêle bien chaude.", "Garnir de jambon, de fromage râpé et casser un œuf au centre.", "Replier les bords en carré et poursuivre la cuisson jusqu'à ce que l'œuf soit cuit."],
    ingredients: [{ nom: "farine de sarrasin", quantite: 250, unite: "g" }, { nom: "jambon blanc", quantite: 4, unite: "pièce" }, { nom: "gruyère râpé", quantite: 150, unite: "g" }, { nom: "œuf", quantite: 4, unite: "pièce" }],
  },
  {
    titre: "Curry vert thaï au poulet",
    photo: "/recipes/curry-vert-thai-poulet.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 8,
    description: "Poulet mijoté dans un curry vert coco parfumé au basilic thaï.",
    calories: 480, proteines: 28, lipides: 28,
    tags: ["épicé", "sans gluten"],
    etapes: ["Faire revenir la pâte de curry vert dans un peu d'huile.", "Ajouter le poulet coupé en morceaux et faire dorer.", "Verser le lait de coco, ajouter les légumes et laisser mijoter 15 min.", "Parsemer de basilic thaï avant de servir avec du riz."],
    ingredients: [{ nom: "blanc de poulet", quantite: 400, unite: "g" }, { nom: "pâte de curry vert", quantite: 2, unite: "cuillère à soupe" }, { nom: "lait de coco", quantite: 400, unite: "ml" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "riz basmati", quantite: 200, unite: "g" }, { nom: "basilic thaï", quantite: 1, unite: "botte" }],
  },
  {
    titre: "Salade César au poulet",
    photo: "/recipes/salade-cesar-poulet.jpg",
    temps_preparation: 20, difficulte: "facile", prix_estime: 7,
    description: "Poulet grillé, salade romaine, croûtons et sauce César maison.",
    calories: 430, proteines: 30, lipides: 24,
    tags: ["riche en protéines", "rapide"],
    etapes: ["Griller les blancs de poulet et les couper en lanières.", "Faire dorer des cubes de pain pour les croûtons.", "Mélanger la salade romaine avec la sauce César et le parmesan.", "Ajouter le poulet et les croûtons juste avant de servir."],
    ingredients: [{ nom: "blanc de poulet", quantite: 350, unite: "g" }, { nom: "salade romaine", quantite: 1, unite: "pièce" }, { nom: "parmesan", quantite: 50, unite: "g" }, { nom: "pain de campagne", quantite: 2, unite: "tranche" }, { nom: "sauce césar", quantite: 4, unite: "cuillère à soupe" }],
  },
  {
    titre: "Moussaka",
    photo: "/recipes/moussaka.jpg",
    temps_preparation: 90, difficulte: "difficile", prix_estime: 9,
    description: "Aubergines fondantes, viande hachée épicée et béchamel gratinée.",
    calories: 500, proteines: 24, lipides: 30,
    tags: ["hiver"],
    etapes: ["Couper les aubergines en tranches, les faire dorer à la poêle.", "Préparer une sauce à l'agneau ou au bœuf haché avec tomates, cannelle et oignon.", "Alterner aubergines et viande dans un plat, napper de béchamel.", "Enfourner 40 min à 190°C jusqu'à ce que le dessus soit doré."],
    ingredients: [{ nom: "aubergine", quantite: 3, unite: "pièce" }, { nom: "bœuf haché", quantite: 400, unite: "g" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "béchamel", quantite: 400, unite: "g" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "cannelle", quantite: 1, unite: "pincée" }],
  },
  {
    titre: "Paella aux fruits de mer",
    photo: "/recipes/paella-fruits-de-mer.jpg",
    temps_preparation: 55, difficulte: "moyen", prix_estime: 13,
    description: "Riz au safran, crevettes, moules et calamars.",
    calories: 460, proteines: 30, lipides: 12,
    tags: ["riche en protéines", "été"],
    etapes: ["Faire revenir l'oignon, l'ail et le poivron dans l'huile d'olive.", "Ajouter le riz et le safran, mélanger 2 min.", "Mouiller avec le bouillon chaud petit à petit, laisser cuire 18 min sans remuer.", "Ajouter crevettes, moules et calamars les 5 dernières minutes de cuisson."],
    ingredients: [{ nom: "riz rond", quantite: 350, unite: "g" }, { nom: "crevettes", quantite: 200, unite: "g" }, { nom: "moules", quantite: 300, unite: "g" }, { nom: "calamars", quantite: 200, unite: "g" }, { nom: "safran", quantite: 1, unite: "pincée" }, { nom: "bouillon de poisson", quantite: 1, unite: "l" }, { nom: "poivron", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Burger maison",
    photo: "/recipes/burger-maison.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 8,
    description: "Steak haché, cheddar fondant, crudités croquantes dans un pain moelleux.",
    calories: 620, proteines: 32, lipides: 34,
    tags: ["rapide"],
    etapes: ["Façonner les steaks hachés et les assaisonner.", "Cuire les steaks à la poêle avec une tranche de cheddar dessus.", "Griller légèrement les pains à burger.", "Monter le burger avec salade, tomate, oignons et sauce."],
    ingredients: [{ nom: "bœuf haché", quantite: 500, unite: "g" }, { nom: "pain à burger", quantite: 4, unite: "pièce" }, { nom: "cheddar", quantite: 4, unite: "tranche" }, { nom: "salade", quantite: 1, unite: "pièce" }, { nom: "tomate", quantite: 2, unite: "pièce" }, { nom: "oignon rouge", quantite: 1, unite: "pièce" }],
  },
  {
    titre: "Gyoza",
    photo: "/recipes/gyoza.jpg",
    temps_preparation: 45, difficulte: "moyen", prix_estime: 6,
    description: "Raviolis japonais au porc et chou, dorés à la poêle et vapeur.",
    calories: 380, proteines: 18, lipides: 16,
    tags: ["riche en protéines"],
    etapes: ["Mélanger le porc haché, le chou émincé, l'ail, le gingembre et la sauce soja.", "Garnir les feuilles de raviolis et bien souder les bords.", "Saisir les gyoza à la poêle jusqu'à ce que le dessous soit doré.", "Ajouter un fond d'eau, couvrir et laisser cuire à la vapeur 5 min."],
    ingredients: [{ nom: "porc haché", quantite: 300, unite: "g" }, { nom: "feuilles de raviolis chinois", quantite: 30, unite: "pièce" }, { nom: "chou chinois", quantite: 200, unite: "g" }, { nom: "gingembre", quantite: 1, unite: "cuillère à café" }, { nom: "sauce soja", quantite: 2, unite: "cuillère à soupe" }, { nom: "ail", quantite: 2, unite: "pièce" }],
  },
  {
    titre: "Shakshuka",
    photo: "/recipes/shakshuka.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 5,
    description: "Œufs pochés dans une sauce tomate épicée aux poivrons.",
    calories: 340, proteines: 18, lipides: 20,
    tags: ["végétarien", "épicé", "économique"],
    etapes: ["Faire revenir oignon et poivron dans l'huile d'olive.", "Ajouter les tomates concassées, le cumin et le paprika, laisser mijoter 15 min.", "Creuser des puits dans la sauce et y casser les œufs.", "Couvrir et laisser cuire jusqu'à ce que les blancs soient pris."],
    ingredients: [{ nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "œuf", quantite: 4, unite: "pièce" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "cumin", quantite: 1, unite: "cuillère à café" }, { nom: "paprika", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Bibimbap",
    photo: "/recipes/bibimbap.jpg",
    temps_preparation: 35, difficulte: "moyen", prix_estime: 8,
    description: "Riz garni de légumes sautés, bœuf mariné et œuf au plat, sauce gochujang.",
    calories: 520, proteines: 26, lipides: 18,
    tags: ["riche en protéines"],
    etapes: ["Cuire le riz.", "Faire sauter séparément carottes, épinards et champignons.", "Faire revenir le bœuf mariné à la sauce soja.", "Dresser le riz avec les légumes, le bœuf et un œuf au plat, servir avec de la sauce gochujang."],
    ingredients: [{ nom: "riz rond", quantite: 300, unite: "g" }, { nom: "bœuf émincé", quantite: 250, unite: "g" }, { nom: "carotte", quantite: 2, unite: "pièce" }, { nom: "épinards", quantite: 150, unite: "g" }, { nom: "champignon de paris", quantite: 150, unite: "g" }, { nom: "œuf", quantite: 4, unite: "pièce" }, { nom: "sauce gochujang", quantite: 2, unite: "cuillère à soupe" }],
  },
  {
    titre: "Crêpe jambon-fromage",
    photo: "/recipes/crepe-jambon-fromage.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 4,
    description: "Crêpe de froment salée garnie de jambon et fromage fondant.",
    calories: 380, proteines: 18, lipides: 16,
    tags: ["rapide", "économique"],
    etapes: ["Préparer la pâte à crêpes salée et laisser reposer 20 min.", "Cuire les crêpes à la poêle.", "Garnir de jambon et de fromage râpé, replier en carré.", "Poursuivre la cuisson jusqu'à ce que le fromage soit fondu."],
    ingredients: [{ nom: "farine", quantite: 250, unite: "g" }, { nom: "lait", quantite: 50, unite: "cl" }, { nom: "œuf", quantite: 3, unite: "pièce" }, { nom: "jambon blanc", quantite: 4, unite: "pièce" }, { nom: "gruyère râpé", quantite: 150, unite: "g" }],
  },
  {
    titre: "Tarte aux pommes",
    photo: "/recipes/tarte-aux-pommes.jpg",
    temps_preparation: 50, difficulte: "facile", prix_estime: 5,
    description: "Pâte croustillante et pommes fondantes légèrement caramélisées.",
    calories: 310, proteines: 4, lipides: 12,
    tags: ["sucré", "économique"],
    etapes: ["Préchauffer le four à 180°C et foncer un moule avec la pâte.", "Éplucher et couper les pommes en fines lamelles.", "Disposer les pommes en rosace sur la pâte, saupoudrer de sucre.", "Cuire 35 min jusqu'à ce que la pâte soit dorée."],
    ingredients: [{ nom: "pâte brisée", quantite: 1, unite: "pièce" }, { nom: "pomme", quantite: 5, unite: "pièce" }, { nom: "sucre", quantite: 60, unite: "g" }, { nom: "beurre", quantite: 20, unite: "g" }],
  },
  {
    titre: "Granola maison aux fruits rouges",
    photo: "/recipes/granola-fruits-rouges.jpg",
    temps_preparation: 30, difficulte: "facile", prix_estime: 4,
    description: "Flocons d'avoine croustillants au four, fruits rouges frais et yaourt.",
    calories: 380, proteines: 12, lipides: 14,
    tags: ["végétarien", "rapide"],
    etapes: ["Mélanger les flocons d'avoine, le miel et l'huile.", "Étaler sur une plaque et cuire 20 min à 160°C en remuant à mi-cuisson.", "Laisser refroidir pour que le granola devienne croustillant.", "Servir avec du yaourt et des fruits rouges frais."],
    ingredients: [{ nom: "flocons d'avoine", quantite: 250, unite: "g" }, { nom: "miel", quantite: 3, unite: "cuillère à soupe" }, { nom: "huile de coco", quantite: 2, unite: "cuillère à soupe" }, { nom: "fruits rouges", quantite: 200, unite: "g" }, { nom: "yaourt nature", quantite: 400, unite: "g" }],
  },
  {
    titre: "Minestrone",
    photo: "/recipes/minestrone.jpg",
    temps_preparation: 40, difficulte: "facile", prix_estime: 5,
    description: "Soupe italienne aux légumes de saison, haricots blancs et petites pâtes.",
    calories: 250, proteines: 10, lipides: 6,
    tags: ["végan", "économique", "hiver"],
    etapes: ["Faire revenir oignon, carotte et céleri dans l'huile d'olive.", "Ajouter les tomates concassées, le bouillon et les haricots blancs, laisser mijoter 20 min.", "Ajouter les petites pâtes et cuire encore 10 min.", "Servir avec un filet d'huile d'olive et du parmesan."],
    ingredients: [{ nom: "carotte", quantite: 2, unite: "pièce" }, { nom: "céleri", quantite: 1, unite: "branche" }, { nom: "oignon", quantite: 1, unite: "pièce" }, { nom: "tomates concassées", quantite: 400, unite: "g" }, { nom: "haricots blancs cuits", quantite: 300, unite: "g" }, { nom: "petites pâtes", quantite: 100, unite: "g" }],
  },
  {
    titre: "Salade grecque",
    photo: "/recipes/salade-grecque.jpg",
    temps_preparation: 15, difficulte: "facile", prix_estime: 5,
    description: "Concombre, tomates, feta et olives, vinaigrette à l'origan.",
    calories: 320, proteines: 10, lipides: 24,
    tags: ["végétarien", "été", "rapide", "sans gluten"],
    etapes: ["Couper le concombre, les tomates et l'oignon rouge en gros morceaux.", "Ajouter les olives et la feta en gros dés.", "Assaisonner d'huile d'olive, de vinaigre et d'origan."],
    ingredients: [{ nom: "concombre", quantite: 1, unite: "pièce" }, { nom: "tomate", quantite: 3, unite: "pièce" }, { nom: "feta", quantite: 150, unite: "g" }, { nom: "olives noires", quantite: 80, unite: "g" }, { nom: "oignon rouge", quantite: 1, unite: "pièce" }, { nom: "huile d'olive", quantite: 3, unite: "cuillère à soupe" }],
  },
  {
    titre: "Pizza margherita",
    photo: "/recipes/pizza-margherita.jpg",
    temps_preparation: 35, difficulte: "moyen", prix_estime: 5,
    description: "Pâte fine, sauce tomate, mozzarella fondante et basilic frais.",
    calories: 480, proteines: 20, lipides: 18,
    tags: ["économique"],
    etapes: ["Étaler la pâte à pizza sur une plaque.", "Napper de sauce tomate et répartir la mozzarella en tranches.", "Enfourner 12 min à 220°C jusqu'à ce que la pâte soit dorée.", "Parsemer de basilic frais et d'un filet d'huile d'olive à la sortie du four."],
    ingredients: [{ nom: "pâte à pizza", quantite: 1, unite: "pièce" }, { nom: "sauce tomate", quantite: 150, unite: "g" }, { nom: "mozzarella", quantite: 200, unite: "g" }, { nom: "basilic frais", quantite: 1, unite: "botte" }],
  },
  {
    titre: "Wok de légumes au tofu",
    photo: "/recipes/wok-legumes-tofu.jpg",
    temps_preparation: 25, difficulte: "facile", prix_estime: 6,
    description: "Tofu doré, légumes croquants sautés au wok, sauce soja-gingembre.",
    calories: 350, proteines: 18, lipides: 16,
    tags: ["végan", "rapide", "sans gluten"],
    etapes: ["Couper le tofu en cubes et le faire dorer à la poêle.", "Couper les légumes en lanières.", "Faire sauter les légumes à feu vif quelques minutes pour qu'ils restent croquants.", "Ajouter le tofu, la sauce soja et le gingembre, mélanger 2 min."],
    ingredients: [{ nom: "tofu ferme", quantite: 300, unite: "g" }, { nom: "poivron", quantite: 1, unite: "pièce" }, { nom: "carotte", quantite: 2, unite: "pièce" }, { nom: "brocoli", quantite: 200, unite: "g" }, { nom: "sauce soja", quantite: 3, unite: "cuillère à soupe" }, { nom: "gingembre", quantite: 1, unite: "cuillère à café" }],
  },
  {
    titre: "Soupe à l'oignon gratinée",
    photo: "/recipes/soupe-a-loignon.jpg",
    temps_preparation: 60, difficulte: "moyen", prix_estime: 5,
    description: "Oignons caramélisés dans un bouillon riche, croûton et gruyère gratiné.",
    calories: 360, proteines: 14, lipides: 18,
    tags: ["hiver", "économique"],
    etapes: ["Faire fondre les oignons émincés dans le beurre 30 min à feu doux jusqu'à ce qu'ils caramélisent.", "Ajouter le bouillon de bœuf et laisser mijoter 20 min.", "Répartir dans des bols, ajouter un croûton de pain et du gruyère râpé.", "Passer sous le grill jusqu'à ce que le fromage soit gratiné."],
    ingredients: [{ nom: "oignon", quantite: 6, unite: "pièce" }, { nom: "bouillon de bœuf", quantite: 1, unite: "l" }, { nom: "beurre", quantite: 40, unite: "g" }, { nom: "gruyère râpé", quantite: 150, unite: "g" }, { nom: "pain de campagne", quantite: 4, unite: "tranche" }],
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
    description: r.description || "",
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
    userProfile: { tags_preferences: [], aliments_exclus: [], compte: { nom: "", email: "" } },
    swipeDeckSeenIds: [],
    essentials: ESSENTIAL_SEED.map((nom) => ({ id: uid("ess"), nom })),
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
  if (!d.userProfile.aliments_exclus) d.userProfile.aliments_exclus = [];
  d.shoppingList = (d.shoppingList || []).map((s) => s.source ? s : { ...s, source: "plan" });
  if (!d.essentials) d.essentials = ESSENTIAL_SEED.map((nom) => ({ id: uid("ess"), nom }));
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
  .mp-root * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .mp-root button, .mp-root a, .mp-root [role="button"] { -webkit-tap-highlight-color: transparent; outline: none; }
  .mp-root button:focus:not(:focus-visible) { outline: none; }
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
    position: relative;
  }
  .mp-nav-indicator-pos {
    position: absolute; left: 0; top: 0; width: 0; height: 0;
    transition: transform .36s ease;
    pointer-events: none;
    z-index: 0;
  }
  .mp-nav-indicator-blob {
    position: absolute; left: -21px; top: -38px; width: 42px; height: 38px;
    border-radius: 21px 21px 8px 8px;
    background: var(--ink);
  }
  .mp-nav-btn { position: relative; z-index: 1; }
  .mp-nav-brand { display: none; }
  .mp-topbar {
    display: flex; justify-content: flex-end; margin-bottom: 8px; flex-shrink: 0;
    padding: calc(16px + env(safe-area-inset-top, 0px)) calc(16px + env(safe-area-inset-right, 0px)) 0 calc(16px + env(safe-area-inset-left, 0px));
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
  .mp-nav-icon-wrap {
    width: 36px; height: 36px; border-radius: 50%; position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    transition: color .3s ease;
  }
  .mp-nav-btn:hover { background: var(--surface-2); color: var(--ink); }
  .mp-nav-btn.active { background: transparent; color: var(--sage); }
  .mp-nav-btn.active .mp-nav-icon-wrap { color: #fff; }
  .mp-nav-btn.center .mp-nav-icon-wrap {
    width: 58px; height: 58px; border-radius: 50%; background: var(--ink); color: #fff;
    display: flex; align-items: center; justify-content: center; margin-bottom: 2px;
    margin-top: -14px; box-shadow: 0 4px 12px rgba(42,32,21,.35);
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mp-discover-fill { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; position: relative; }
  .mp-undo-toast {
    position: absolute; left: 16px; right: 16px; bottom: 8px; z-index: 20;
    background: var(--ink); color: #fff; border-radius: 14px; padding: 10px 8px 10px 16px;
    display: flex; align-items: center; justify-content: space-between; font-size: 13px;
    box-shadow: 0 8px 20px rgba(0,0,0,.25);
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
  .mp-deck-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 0; flex: 1; min-height: 0; }
  .mp-deck { position: relative; width: 100%; max-width: 320px; flex: 1; min-height: 190px; max-height: 420px; }
  .mp-swipe-card {
    position: absolute; inset: 0; border-radius: 32px; background: var(--surface);
    border: none; display: flex; flex-direction: column; overflow: hidden;
    box-shadow: 0 8px 24px rgba(160,20,70,.16); cursor: grab; user-select: none;
  }
  .mp-swipe-photo-wrap { height: 44%; flex-shrink: 0; position: relative; overflow: hidden; }
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
  .mp-swipe-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0; overflow: hidden; }
  .mp-swipe-title { font-size: 16px; font-weight: 600; margin: 0; }
  .mp-swipe-desc { font-size: 12.5px; color: var(--ink-soft); line-height: 1.35; margin: 1px 0 0; }
  .mp-swipe-meta { font-size: 12.5px; color: var(--ink-soft); display: flex; gap: 12px; flex-wrap: wrap; }
  @media (max-height: 700px) {
    .mp-swipe-photo-wrap { height: 36%; }
    .mp-swipe-body { padding: 10px 16px; gap: 4px; }
    .mp-swipe-desc { display: none; }
    .mp-stat-pill { padding: 6px 6px; }
    .mp-stat-pill .mp-stat-value { font-size: 15px; }
    .mp-deck { min-height: 150px; }
  }
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
  .mp-round-btn.like { background: var(--sage); border-color: var(--sage); color: #fff; }
  .mp-round-btn.pass { background: var(--danger); border-color: var(--danger); color: #fff; }
  .mp-round-btn.info { width: 38px; height: 38px; background: var(--surface-2); border-color: var(--surface-2); color: var(--ink-soft); }
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

  .mp-segmented { display: inline-flex; background: var(--surface-2); border-radius: 999px; padding: 3px; gap: 2px; }
  .mp-segmented button {
    border: none; background: transparent; padding: 7px 18px; border-radius: 999px;
    font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; font-family: inherit;
    transition: background .15s ease, color .15s ease;
  }
  .mp-segmented button.active { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(42,32,21,.1); }
  .mp-day-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .mp-day-chip {
    flex-shrink: 0; width: 52px; padding: 10px 0; border-radius: 16px; background: var(--surface);
    border: 1px solid var(--line); display: flex; flex-direction: column; align-items: center; gap: 2px;
    cursor: pointer; color: var(--ink-soft);
  }
  .mp-day-chip .mp-day-num { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: var(--ink); }
  .mp-day-chip.selected { background: var(--sage); border-color: var(--sage); }
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

  .mp-root * { scrollbar-width: none; -ms-overflow-style: none; }
  .mp-root *::-webkit-scrollbar { display: none; width: 0; height: 0; }

  .mp-slide-track { flex: 1; min-height: 0; position: relative; overflow: hidden; }
  .mp-slide-pane {
    position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 0 calc(16px + env(safe-area-inset-right, 0px)) 18px calc(16px + env(safe-area-inset-left, 0px));
    transition: transform .32s cubic-bezier(.22, 1, .36, 1);
    will-change: transform;
    display: flex; flex-direction: column;
  }
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
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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

function CreateScreen({ data, update, setRecipeModal }) {
  const emptyForm = { titre: "", photo: null, temps: "30 min", portions: 4, ingredientsText: "", etapesText: "", difficulte: "", prix_estime: "", calories: "", proteines: "", lipides: "", tag_ids: [] };
  const [form, setForm] = useState(emptyForm);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showMyRecipes, setShowMyRecipes] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);
  const myRecipes = data.recipes.filter((r) => r.origine === "utilisateur");

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
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {myRecipes.length > 0 && (
            <button className="mp-round-btn" style={{ width: 38, height: 38 }} onClick={() => setShowMyRecipes(true)} title="Mes créations">
              <BookOpen size={16} />
            </button>
          )}
          <div className="mp-round-btn" style={{ width: 38, height: 38, background: "var(--surface-2)", color: "var(--terracotta)", cursor: "default" }} title="Assistant IA (bientôt)">
            <Sparkles size={17} />
          </div>
        </div>
      </div>

      {showMyRecipes && (
        <Modal onClose={() => setShowMyRecipes(false)}>
          <div className="mp-modal-head">
            <div>
              <div className="mp-eyebrow">{myRecipes.length} recette{myRecipes.length !== 1 ? "s" : ""}</div>
              <h2 className="mp-serif" style={{ fontSize: 20, margin: 0 }}>Mes créations</h2>
            </div>
            <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => setShowMyRecipes(false)}><X size={16} /></button>
          </div>
          {myRecipes.length === 0 ? (
            <EmptyState icon={<Pencil size={32} />} title="Pas encore de création" body="Les recettes que tu crées apparaîtront ici." />
          ) : (
            <div className="mp-grid">
              {myRecipes.map((r) => (
                <div key={r.id} className="mp-rcard" onClick={() => { setShowMyRecipes(false); setRecipeModal(r.id); }}>
                  <RecipeThumb recipe={r} className="mp-rcard-photo" />
                  <div className="mp-rcard-body">
                    <p className="mp-rcard-title">{r.titre}</p>
                    <div className="mp-rcard-meta">{[r.temps_preparation ? `${r.temps_preparation} min` : null, r.difficulte].filter(Boolean).join(" · ")}</div>
                  </div>
                  {r.liked && (
                    <span style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={11} color="var(--sage-deep)" fill="var(--sage-deep)" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

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

function DiscoverScreen({ data, deckRecipes, profileTagIds, useProfileFilter, setUseProfileFilter, discoverFilterTags, setDiscoverFilterTags, toggleLike, markSeen, unmarkSeen, resetDeck, setRecipeModal, goToProfile }) {
  const top = deckRecipes[0];
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [lastPassedId, setLastPassedId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    if (!lastPassedId) return;
    const t = setTimeout(() => setLastPassedId(null), 4000);
    return () => clearTimeout(t);
  }, [lastPassedId]);

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
    if (dir === "like") toggleLike(top.id);
    else { markSeen(top.id); setLastPassedId(top.id); }
    setDrag({ x: 0, active: false });
  };
  const undoPass = () => {
    if (!lastPassedId) return;
    unmarkSeen(lastPassedId);
    setLastPassedId(null);
  };
  const onUp = () => {
    if (!drag.active) return;
    if (drag.x > 110) resolveSwipe("like");
    else if (drag.x < -110) resolveSwipe("pass");
    else setDrag({ x: 0, active: false });
  };

  return (
    <div className="mp-discover-fill">
      <div className="mp-header" style={{ marginBottom: 8, flexShrink: 0 }}>
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
          <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => setShowSearch(true)} aria-label="Rechercher une recette"><Search size={15} /></button>
        </div>
      </div>

      {showSearch && (
        <RecipeSearchModal data={data} onClose={() => setShowSearch(false)}
          onPick={(id) => { setShowSearch(false); setRecipeModal(id); }} />
      )}

      {!useProfileFilter && (
        <div className="mp-scroll-x" style={{ marginBottom: 8, flexShrink: 0 }}>
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
                  <button className="mp-photo-like" style={{ border: "none", padding: 0, cursor: "pointer", background: r.liked ? "var(--terracotta)" : "rgba(255,255,255,.9)", color: r.liked ? "#fff" : "var(--terracotta)" }}
                    onClick={(e) => { e.stopPropagation(); toggleLike(r.id); }} aria-label="Liker">
                    <Heart size={15} fill={r.liked ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="mp-swipe-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="mp-eyebrow coral">Recette du jour</span>
                    <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>N° {data.recipes.findIndex((x) => x.id === r.id) + 1}</span>
                  </div>
                  <p className="mp-serif mp-swipe-title">{r.titre}</p>
                  {r.description && <p className="mp-swipe-desc">{r.description}</p>}
                  <div className="mp-swipe-meta">
                    {r.temps_preparation ? <span>{r.temps_preparation} min</span> : null}
                    {r.difficulte ? <span>{capitalize(r.difficulte)}</span> : null}
                    {r.portions ? <span>{r.portions} pers</span> : null}
                  </div>
                  {(r.calories || r.proteines || r.lipides) ? (
                    <div style={{ marginTop: 2 }}>
                      <div className="mp-swipe-desc" style={{ fontSize: 9.5, marginBottom: 3 }}>Valeurs pour 1 portion</div>
                      <div className="mp-stat-row">
                        {r.calories ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.calories}</div><div className="mp-stat-label">kcal</div></div> : null}
                        {r.proteines ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.proteines} g</div><div className="mp-stat-label">Protéines</div></div> : null}
                        {r.lipides ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.lipides} g</div><div className="mp-stat-label">Lipides</div></div> : null}
                      </div>
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
          <div className="mp-deck-actions" style={{ flexShrink: 0 }}>
            <button className="mp-round-btn like" onClick={() => resolveSwipe("like")} aria-label="J'aime"><Heart size={20} fill="currentColor" /></button>
            <button className="mp-round-btn info" onClick={() => setRecipeModal(top.id)} aria-label="Plus d'informations"><Info size={17} /></button>
            <button className="mp-round-btn pass" onClick={() => resolveSwipe("pass")} aria-label="Passer"><X size={20} /></button>
          </div>
        )}
      </div>

      <div className="mp-card" style={{ marginTop: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 12 }}>
        <div>
          <div className="mp-serif" style={{ fontSize: 14, fontWeight: 600 }}>À votre sauce</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>Portions, ingrédients, allergies…</div>
        </div>
        {goToProfile && (
          <button className="mp-btn mp-btn-primary" style={{ flexShrink: 0, padding: "7px 13px" }} onClick={goToProfile}><Pencil size={12} /> Modifier</button>
        )}
      </div>
      <button className="mp-btn mp-btn-ghost" style={{ display: "flex", flexShrink: 0, margin: "6px auto 0" }} onClick={resetDeck}>
        <RotateCcw size={13} /> Recommencer la sélection
      </button>

      {lastPassedId && (
        <div className="mp-undo-toast">
          <span>Recette passée</span>
          <button onClick={undoPass} style={{ background: "none", border: "none", color: "var(--gold)", fontWeight: 700, cursor: "pointer", fontSize: 13, padding: "6px 8px" }}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

function LikedScreen({ data, likedRecipes, likedSelection, setLikedSelection, setRecipeModal, update, goToDiscover }) {
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

      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search size={14} style={{ position: "absolute", left: 13, top: 12, color: "var(--ink-faint)" }} />
        <input className="mp-input" style={{ paddingLeft: 34, borderRadius: 24 }} placeholder="Chercher une recette" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        <TagPill tone="sage" selected={filter === "toutes"} onClick={() => setFilter("toutes")}>Toutes</TagPill>
        <TagPill tone="sage" selected={filter === "express"} onClick={() => setFilter("express")}>Express</TagPill>
        {vegeTag && <TagPill tone="sage" selected={filter === "vege"} onClick={() => setFilter("vege")}>Végé</TagPill>}
      </div>

      {likedRecipes.length === 0 ? (
        <div className="mp-card" style={{ textAlign: "center", padding: "38px 20px" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", margin: "0 auto 14px",
            background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Heart size={24} color="var(--terracotta)" />
          </div>
          <div className="mp-serif" style={{ fontSize: 17, color: "var(--ink)", marginBottom: 6 }}>Aucune recette likée</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-soft)", marginBottom: goToDiscover ? 18 : 0 }}>
            Va faire un tour dans Swipe pour liker des recettes, qu'elles viennent du catalogue ou que tu les aies créées toi-même.
          </div>
          {goToDiscover && (
            <button className="mp-btn mp-btn-coral" style={{ margin: "0 auto" }} onClick={goToDiscover}>
              <Sparkles size={14} /> Découvrir des recettes
            </button>
          )}
        </div>
      ) : visible.length === 0 ? (
        <div className="mp-card" style={{ textAlign: "center", padding: "34px 20px", color: "var(--ink-soft)" }}>
          <Search size={26} style={{ opacity: 0.4, marginBottom: 10 }} />
          <div className="mp-serif" style={{ fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>Aucun résultat</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>Aucune recette likée ne correspond à cette recherche ou à ce filtre.</div>
        </div>
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
  const [viewMode, setViewMode] = useState("semaine"); // "jour" | "semaine"

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
      <div className="mp-header" style={{ marginBottom: 14 }}>
        <h1 className="mp-serif mp-title">Planning</h1>
        <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={() => clearWeek(weekDatesISO)} aria-label="Vider la semaine" disabled={weekPlanCount === 0}><Trash2 size={14} /></button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="mp-segmented">
          <button className={viewMode === "jour" ? "active" : ""} onClick={() => setViewMode("jour")}>Jour</button>
          <button className={viewMode === "semaine" ? "active" : ""} onClick={() => setViewMode("semaine")}>Semaine</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className="mp-round-btn" style={{ width: 28, height: 28 }} onClick={() => setWeekOffset((o) => o - 1)} aria-label="Semaine précédente"><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 12, color: "var(--ink-soft)", minWidth: 74, textAlign: "center" }}>{weekLabelPrefix}</span>
          <button className="mp-round-btn" style={{ width: 28, height: 28 }} onClick={() => setWeekOffset((o) => o + 1)} aria-label="Semaine suivante"><ChevronRight size={14} /></button>
        </div>
      </div>

      {viewMode === "jour" ? (
        <>
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
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 18 }}>
          {weekDates.map((d, i) => {
            const iso = isoDate(d);
            const daySlots = ["midi", "soir"].map((moment) => ({ moment, slot: findSlot(iso, moment) }));
            const isToday = iso === todayISO;
            return (
              <div key={iso}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span className="mp-serif" style={{ fontSize: 15, fontWeight: 600, textTransform: "capitalize" }}>{DOW_LONG[i]} {d.getDate()}</span>
                  {isToday && <span className="mp-eyebrow coral" style={{ fontSize: 10 }}>Aujourd'hui</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {daySlots.map(({ moment, slot }) => {
                    const recipe = slot ? data.recipes.find((r) => r.id === slot.recipe_id) : null;
                    return recipe ? (
                      <div key={moment} className="mp-meal-card" style={{ padding: 8 }} onClick={() => setRecipeModal(recipe.id)}>
                        <RecipeThumb recipe={recipe} className="mp-meal-thumb" style={{ width: 42, height: 42 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="mp-eyebrow" style={{ fontSize: 9.5 }}>{MOMENT_LABEL[moment].toUpperCase()}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{recipe.titre}</div>
                        </div>
                        <Trash2 size={13} style={{ cursor: "pointer", flexShrink: 0, color: "var(--ink-faint)" }} onClick={(e) => { e.stopPropagation(); removeFromPlan(slot.id); }} />
                      </div>
                    ) : (
                      <div key={moment} className="mp-meal-slot-empty" style={{ padding: 9, fontSize: 12.5 }}
                        onClick={() => setPicker({ dateISO: iso, dayIdx: i, moment })}>
                        <Plus size={13} /> {MOMENT_LABEL[moment]}…
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

function ShoppingScreen({ data, generateShoppingList, toggleShoppingItem, clearShoppingList, addManualShoppingItem, removeShoppingItem, goToPlanning, addEssential, removeEssential, addEssentialToCart }) {
  const [weekStart, setWeekStart] = useState(() => isoDate(mondayOf(todayDate())));
  const [showAddItem, setShowAddItem] = useState(false);
  const [manageEssentials, setManageEssentials] = useState(false);
  const [newEssential, setNewEssential] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const toggleExpanded = (id) => setExpandedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
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

      <div className="mp-card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="mp-serif" style={{ fontSize: 15, fontWeight: 600 }}>Essentiels du quotidien</div>
          <button className="mp-round-btn" style={{ width: 30, height: 30 }} onClick={() => setManageEssentials((s) => !s)} aria-label="Gérer les essentiels">
            {manageEssentials ? <Check size={14} /> : <SlidersHorizontal size={13} />}
          </button>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
          Note ici ce qui te manque à la maison (dentifrice, lessive, litière…) et pioche-le d'un tap quand tu fais les courses.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {data.essentials.map((e) => (
            <span key={e.id} className="mp-tag clickable" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              onClick={() => (manageEssentials ? removeEssential(e.id) : addEssentialToCart(e))}>
              {e.nom} {manageEssentials ? <X size={11} /> : <Plus size={11} />}
            </span>
          ))}
          {data.essentials.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Aucun essentiel pour l'instant.</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input className="mp-input" placeholder="Ex. Papier toilette" value={newEssential}
            onChange={(e) => setNewEssential(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && newEssential.trim()) { addEssential(newEssential.trim()); setNewEssential(""); } }} />
          <button className="mp-btn mp-btn-ghost" disabled={!newEssential.trim()}
            onClick={() => { if (newEssential.trim()) { addEssential(newEssential.trim()); setNewEssential(""); } }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

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
        <div className="mp-card" style={{ textAlign: "center", padding: "34px 20px", color: "var(--ink-soft)" }}>
          <ShoppingCart size={26} style={{ opacity: 0.4, marginBottom: 10 }} />
          <div className="mp-serif" style={{ fontSize: 16, color: "var(--ink)", marginBottom: 4 }}>Panier vide</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            {weekPlanCount === 0 ? "Planifie des recettes sur cette semaine, pioche dans tes essentiels ci-dessus, ou ajoute un article directement." : "Clique sur « Générer depuis cette semaine » pour construire ta liste."}
          </div>
        </div>
      ) : (
        categoriesPresent.map((cat) => (
          <div key={cat}>
            <div className="mp-shop-section-title">
              {cat} <span className="mp-shop-section-count">{grouped[cat].length}</span>
            </div>
            <div className="mp-card" style={{ padding: 0 }}>
              {grouped[cat]
                .sort((a, b) => ingredientName(data, a.ingredient_id).localeCompare(ingredientName(data, b.ingredient_id)))
                .map((s) => {
                  const recetteNoms = (s.recette_ids || []).map((rid) => data.recipes.find((r) => r.id === rid)?.titre).filter(Boolean);
                  const expanded = expandedIds.has(s.id);
                  return (
                    <div key={s.id}>
                      <div className="mp-shop-item">
                        <div className={`mp-shop-check-round ${s.coche ? "checked" : ""}`} onClick={() => toggleShoppingItem(s.id)}>
                          {s.coche && <Check size={13} />}
                        </div>
                        <span className={`mp-shop-name ${s.coche ? "checked" : ""}`}>
                          {s.quantite_totale ? `${s.quantite_totale}${s.unite ? ` ${s.unite}` : ""} ` : ""}{ingredientName(data, s.ingredient_id)}
                        </span>
                        {recetteNoms.length > 0 && (
                          <Info size={14} style={{ cursor: "pointer", color: expanded ? "var(--sage-deep)" : "var(--ink-faint)", flexShrink: 0 }}
                            onClick={() => toggleExpanded(s.id)} aria-label="Voir les recettes liées" />
                        )}
                        <Minus size={14} style={{ cursor: "pointer", color: "var(--ink-faint)", flexShrink: 0 }} onClick={() => removeShoppingItem(s.id)} />
                      </div>
                      {expanded && recetteNoms.length > 0 && (
                        <div style={{ padding: "0 12px 10px 46px", fontSize: 12, color: "var(--ink-soft)" }}>
                          Utilisé dans : {recetteNoms.join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
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

function ProfileScreen({ data, update, toggleAlimentExclu }) {
  const [tab, setTab] = useState("regime");
  const [newExclu, setNewExclu] = useState("");
  const compte = data.userProfile.compte || { nom: "", email: "" };
  const alimentsExclus = data.userProfile.aliments_exclus || [];

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
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
          <div className="mp-card">
            <div className="mp-label" style={{ marginBottom: 10 }}>Préférences de régime</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.tags.map((t) => (
                <TagPill key={t.id} selected={data.userProfile.tags_preferences.includes(t.id)} onClick={() => toggleTag(t.id)}>{t.nom}</TagPill>
              ))}
            </div>
          </div>

          <div className="mp-card">
            <div className="mp-label" style={{ marginBottom: 6 }}>Aliments à éviter</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
              Les recettes contenant l'un de ces ingrédients seront écartées du Swipe.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
              {alimentsExclus.map((nom) => (
                <TagPill key={nom} selected onClick={() => toggleAlimentExclu(nom)}>{capitalize(nom)} <X size={11} /></TagPill>
              ))}
              {alimentsExclus.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>Aucun aliment exclu.</span>}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <input className="mp-input" placeholder="Ex. coriandre, champignons…" value={newExclu}
                onChange={(e) => setNewExclu(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newExclu.trim()) { toggleAlimentExclu(newExclu.trim()); setNewExclu(""); } }} />
              <button className="mp-btn mp-btn-ghost" disabled={!newExclu.trim()}
                onClick={() => { if (newExclu.trim()) { toggleAlimentExclu(newExclu.trim()); setNewExclu(""); } }}>
                <Plus size={14} />
              </button>
            </div>
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
  const [importError, setImportError] = useState("");
  const [importDone, setImportDone] = useState(false);
  const importInputRef = useRef(null);

  const doReset = () => {
    update(() => buildSeedData());
    setConfirmReset(false);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recipy-sauvegarde-${isoDate(todayDate())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.recipes) || !Array.isArray(parsed.ingredients)) {
          throw new Error("format invalide");
        }
        update(() => migrateWeeklyPlan(parsed));
        setImportError("");
        setImportDone(true);
        setTimeout(() => setImportDone(false), 4000);
      } catch {
        setImportError("Fichier invalide — vérifie que c'est bien une sauvegarde Recipy (.json).");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
      <div className="mp-card">
        <div className="mp-label" style={{ marginBottom: 10 }}>Sauvegarde</div>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.5 }}>
          Tout est stocké uniquement sur cet appareil — si tu changes de téléphone ou vides le cache, tout est perdu. Exporte régulièrement un fichier de sauvegarde pour pouvoir tout restaurer.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="mp-btn mp-btn-sage" style={{ color: "#fff" }} onClick={handleExport}><Download size={14} /> Exporter mes données</button>
          <input ref={importInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImportFile} />
          <button className="mp-btn mp-btn-ghost" onClick={() => importInputRef.current?.click()}><Upload size={14} /> Importer une sauvegarde</button>
        </div>
        {importDone && <div style={{ fontSize: 12.5, color: "var(--sage-deep)", marginTop: 8 }}>Sauvegarde restaurée avec succès.</div>}
        {importError && <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 8 }}>{importError}</div>}
      </div>

      <div className="mp-card">
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
    </div>
  );
}

/* ---------- Recherche de recettes ---------- */

function RecipeSearchModal({ data, onClose, onPick }) {
  const [query, setQuery] = useState("");
  const q = normalizeName(query);
  const results = q ? data.recipes.filter((r) => normalizeName(r.titre).includes(q)) : data.recipes;

  return (
    <Modal onClose={onClose}>
      <div className="mp-modal-head">
        <div>
          <div className="mp-eyebrow">{data.recipes.length} recettes au total</div>
          <h2 className="mp-serif" style={{ fontSize: 20, margin: 0 }}>Rechercher</h2>
        </div>
        <button className="mp-round-btn" style={{ width: 34, height: 34 }} onClick={onClose}><X size={16} /></button>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={14} style={{ position: "absolute", left: 13, top: 13, color: "var(--ink-faint)" }} />
        <input className="mp-input" style={{ paddingLeft: 34, borderRadius: 24 }} autoFocus
          placeholder="Chercher une recette par nom…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {results.length === 0 ? (
        <EmptyState icon={<Search size={32} />} title="Aucun résultat" body="Aucune recette ne correspond à cette recherche." />
      ) : (
        <div className="mp-grid">
          {results.map((r) => (
            <div key={r.id} className="mp-rcard" onClick={() => onPick(r.id)}>
              <div style={{ position: "relative" }}>
                <RecipeThumb recipe={r} className="mp-rcard-photo" />
                {r.liked && <span className="mp-photo-like" style={{ top: 8, right: 8, width: 26, height: 26 }}><Heart size={12} fill="currentColor" /></span>}
              </div>
              <div className="mp-rcard-body">
                <p className="mp-rcard-title">{r.titre}</p>
                <div className="mp-rcard-meta">{[r.temps_preparation ? `${r.temps_preparation} min` : null, r.difficulte].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
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
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginBottom: 4 }}>Valeurs pour 1 portion</div>
          <div className="mp-stat-row">
            {r.calories ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.calories}</div><div className="mp-stat-label">kcal</div></div> : null}
            {r.proteines ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.proteines} g</div><div className="mp-stat-label">Protéines</div></div> : null}
            {r.lipides ? <div className="mp-stat-pill"><div className="mp-stat-value">{r.lipides} g</div><div className="mp-stat-label">Lipides</div></div> : null}
          </div>
        </div>
      )}

      {r.tag_ids.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {r.tag_ids.map((tid) => <TagPill key={tid}>{tagName(data, tid)}</TagPill>)}
        </div>
      )}

      {!r.calories && !r.proteines && !r.lipides && r.tag_ids.length === 0 && (
        <div style={{ border: "1.5px dashed var(--line)", borderRadius: 16, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.4 }}>
            Envie d'enrichir cette recette avec des tags ou des infos nutritionnelles ?
          </div>
          <button className="mp-btn mp-btn-ghost" style={{ flexShrink: 0, padding: "6px 12px", fontSize: 12.5 }} onClick={() => onEdit(r.id)}>
            <Pencil size={12} /> Compléter
          </button>
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
  const [tempsText, setTempsText] = useState(() => (original?.temps_preparation ? `${original.temps_preparation} min` : ""));
  const [showMoreOptions, setShowMoreOptions] = useState(!!(original && (original.difficulte || original.prix_estime || original.tag_ids?.length)));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);

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
        setPhotoError(false); setPhotoBusy(false);
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
      const tempsMatch = tempsText.match(/\d+/);
      const finalRecipe = { ...form, temps_preparation: tempsMatch ? Number(tempsMatch[0]) : "", ingredients: resolvedIngredients, etapes };
      const idx = d.recipes.findIndex((r) => r.id === finalRecipe.id);
      if (idx >= 0) d.recipes[idx] = finalRecipe; else d.recipes.push(finalRecipe);
      return d;
    });
    setRecipeModal(null);
  };

  return (
    <Modal onClose={() => setRecipeModal(null)}>
      <div className="mp-modal-head">
        <div>
          <div className="mp-eyebrow">Modifier la recette</div>
          <h1 className="mp-serif" style={{ fontSize: 22, margin: 0 }}>Modifier</h1>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="mp-round-btn like" style={{ width: 38, height: 38, background: form.liked ? "var(--sage)" : "var(--surface)", color: form.liked ? "#fff" : "var(--sage-deep)" }}
            onClick={() => setForm((f) => ({ ...f, liked: !f.liked }))} title="Liker"><Heart size={17} fill={form.liked ? "currentColor" : "none"} /></button>
          <button className="mp-round-btn" style={{ width: 38, height: 38 }} onClick={() => setRecipeModal(null)}><X size={17} /></button>
        </div>
      </div>

      <div className="mp-field">
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
        <div onClick={() => fileInputRef.current?.click()} style={{
          border: "1.5px dashed var(--line)", borderRadius: 20, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: (form.photo && !photoError) ? 0 : "30px 16px", overflow: "hidden", minHeight: 130,
        }}>
          {form.photo && !photoError ? (
            <img src={form.photo} alt="" style={{ width: "100%", maxHeight: 180, objectFit: "cover" }} onError={() => setPhotoError(true)} />
          ) : (
            <>
              <ImageIcon size={22} style={{ marginBottom: 8, color: "var(--ink)" }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>{photoBusy ? "Import…" : "Ajouter une belle photo"}</div>
            </>
          )}
        </div>
        {form.photo && (
          <button className="mp-btn mp-btn-ghost" style={{ marginTop: 8 }} onClick={() => { setForm((f) => ({ ...f, photo: null })); setPhotoError(false); }}>Retirer la photo</button>
        )}
      </div>

      <div className="mp-field">
        <label className="mp-label">Nom de la recette</label>
        <input className="mp-input" placeholder="Ex. Curry doré du dimanche" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <label className="mp-label">Temps</label>
          <input className="mp-input" value={tempsText} onChange={(e) => setTempsText(e.target.value)} placeholder="30 min" />
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
  { id: "liked", label: "Mes likes", icon: Heart },
  { id: "discover", label: "Swipe", icon: Sparkles },
  { id: "shopping", label: "Panier", icon: ShoppingCart },
  { id: "create", label: "Créer", icon: Pencil },
];

export default function MealPlannerApp() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreenState] = useState("discover");
  const [slide, setSlide] = useState(null); // { from, to, dir } | null
  const [slideSettled, setSlideSettled] = useState(false);
  const swipeStartRef = useRef(null);
  const navRef = useRef(null);
  const navIconRefs = useRef({});
  const [navIndicator, setNavIndicator] = useState({ x: 0, y: 0, visible: false });
  const NAV_ORDER = NAV_ITEMS.map((item) => item.id);
  const setScreen = (next) => {
    if (next === screen || slide) return;
    const oldIdx = NAV_ORDER.indexOf(screen);
    const newIdx = NAV_ORDER.indexOf(next);
    let dir = 1;
    if (oldIdx !== -1 && newIdx !== -1) dir = newIdx > oldIdx ? 1 : -1;
    else if (next === "profile") dir = 1;
    else if (screen === "profile") dir = -1;
    setSlide({ from: screen, to: next, dir });
    setScreenState(next);
  };
  useEffect(() => {
    if (!slide) return;
    setSlideSettled(false);
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSlideSettled(true));
    });
    const t = setTimeout(() => { setSlide(null); setSlideSettled(false); }, 340);
    return () => { cancelAnimationFrame(raf1); clearTimeout(t); };
  }, [slide]);
  useEffect(() => {
    const navEl = navRef.current;
    const iconEl = navIconRefs.current[screen];
    if (navEl && iconEl) {
      const navRect = navEl.getBoundingClientRect();
      const iconRect = iconEl.getBoundingClientRect();
      setNavIndicator({
        x: iconRect.left + iconRect.width / 2 - navRect.left,
        y: iconRect.bottom - navRect.top,
        visible: true,
      });
    } else {
      setNavIndicator((s) => ({ ...s, visible: false }));
    }
  }, [screen]);
  const isTabSwipeExcluded = (target) => target.closest && target.closest(".mp-overlay, .mp-swipe-card, .mp-scroll-x, .mp-day-strip, input, textarea, select");
  const resolveTabSwipe = (dx, dy) => {
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const idx = NAV_ORDER.indexOf(screen);
    if (idx === -1) return;
    if (dx < 0 && idx < NAV_ORDER.length - 1) setScreen(NAV_ORDER[idx + 1]);
    else if (dx > 0 && idx > 0) setScreen(NAV_ORDER[idx - 1]);
  };
  const onTabSwipeStart = (e) => {
    if (isTabSwipeExcluded(e.target)) { swipeStartRef.current = null; return; }
    const t = e.touches[0];
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTabSwipeEnd = (e) => {
    if (!swipeStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStartRef.current.x;
    const dy = t.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    resolveTabSwipe(dx, dy);
  };
  const onTabSwipeMouseDown = (e) => {
    if (isTabSwipeExcluded(e.target)) { swipeStartRef.current = null; return; }
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };
  const onTabSwipeMouseUp = (e) => {
    if (!swipeStartRef.current) return;
    const dx = e.clientX - swipeStartRef.current.x;
    const dy = e.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    resolveTabSwipe(dx, dy);
  };
  const [recipeModal, setRecipeModal] = useState(null); // recipe id showing the read-only detail view
  const [editRecipeId, setEditRecipeId] = useState(null); // recipe id currently open in the edit form
  const [discoverFilterTags, setDiscoverFilterTags] = useState([]);
  const [useProfileFilter, setUseProfileFilter] = useState(true);
  const [likedSelection, setLikedSelection] = useState([]);
  const skipNextSave = useRef(true);
  const shuffleOrderRef = useRef(null);

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
          if (!totals[ri.ingredient_id]) totals[ri.ingredient_id] = { quantite: 0, unite: ri.unite, recette_ids: new Set() };
          totals[ri.ingredient_id].quantite += Number(ri.quantite) || 0;
          totals[ri.ingredient_id].recette_ids.add(recipe.id);
        });
      });
      const previousPlanItems = d.shoppingList.filter((s) => s.source === "plan");
      const prevChecked = Object.fromEntries(previousPlanItems.map((s) => [s.ingredient_id, s.coche]));
      const regenerated = Object.entries(totals).map(([ingredient_id, v]) => ({
        id: uid("shop"), ingredient_id, quantite_totale: v.quantite, unite: v.unite,
        coche: prevChecked[ingredient_id] || false, source: "plan", recette_ids: [...v.recette_ids],
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
  const unmarkSeen = useCallback((recipeId) => update((d) => { d.swipeDeckSeenIds = (d.swipeDeckSeenIds || []).filter((x) => x !== recipeId); return d; }), [update]);
  const resetDeck = useCallback(() => {
    shuffleOrderRef.current = null;
    update((d) => { d.swipeDeckSeenIds = []; return d; });
  }, [update]);

  // Essentiels : objets du quotidien (non alimentaires ou récurrents) qu'on veut noter
  // dès qu'on y pense, pour les retrouver au moment de faire les courses.
  const addEssential = useCallback((nom) => {
    update((d) => {
      const key = normalizeName(nom);
      if (!d.essentials.some((e) => normalizeName(e.nom) === key)) {
        d.essentials.push({ id: uid("ess"), nom: nom.trim() });
      }
      return d;
    });
  }, [update]);
  const removeEssential = useCallback((id) => {
    update((d) => { d.essentials = d.essentials.filter((e) => e.id !== id); return d; });
  }, [update]);
  const addEssentialToCart = useCallback((essential) => {
    update((d) => {
      const ing = getOrCreateIngredientByName(d, essential.nom, "");
      const existing = d.shoppingList.find((s) => s.ingredient_id === ing.id && s.source === "manuel");
      if (existing) { existing.quantite_totale += 1; }
      else { d.shoppingList.push({ id: uid("shop"), ingredient_id: ing.id, quantite_totale: 1, unite: "", coche: false, source: "manuel" }); }
      return d;
    });
  }, [update]);

  const toggleAlimentExclu = useCallback((nom) => {
    update((d) => {
      const key = normalizeName(nom);
      const list = d.userProfile.aliments_exclus || [];
      d.userProfile.aliments_exclus = list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
      return d;
    });
  }, [update]);

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
  const alimentsExclus = data.userProfile.aliments_exclus || [];
  const recipeContainsExcluded = (r) => alimentsExclus.some((ex) =>
    r.ingredients.some((ri) => ingredientName(data, ri.ingredient_id).toLowerCase().includes(ex))
  );
  const shuffleOrder = shuffleOrderRef.current || (shuffleOrderRef.current = shuffleArray(data.recipes.map((r) => r.id)));
  const orderIndex = Object.fromEntries(shuffleOrder.map((id, i) => [id, i]));
  const deckRecipes = data.recipes
    .filter((r) =>
      !r.liked &&
      !(data.swipeDeckSeenIds || []).includes(r.id) &&
      (activeFilterTags.length === 0 || activeFilterTags.every((t) => r.tag_ids.includes(t))) &&
      !recipeContainsExcluded(r)
    )
    .sort((a, b) => (orderIndex[a.id] ?? 1e9) - (orderIndex[b.id] ?? 1e9));

  const screenProps = {
    discover: { data, deckRecipes, profileTagIds, useProfileFilter, setUseProfileFilter, discoverFilterTags, setDiscoverFilterTags, toggleLike, markSeen, unmarkSeen, resetDeck, setRecipeModal, goToProfile: () => setScreen("profile") },
    liked: { data, likedRecipes, likedSelection, setLikedSelection, setRecipeModal, update, goToDiscover: () => setScreen("discover") },
    planning: { data, likedRecipes, addToPlan, removeFromPlan, clearWeek, generateShoppingList, setRecipeModal },
    shopping: { data, generateShoppingList, toggleShoppingItem, clearShoppingList, addManualShoppingItem, removeShoppingItem, goToPlanning: () => setScreen("planning"), addEssential, removeEssential, addEssentialToCart },
    create: { data, update, setRecipeModal },
    profile: { data, update, toggleAlimentExclu },
  };

  const ScreenComponents = { discover: DiscoverScreen, liked: LikedScreen, planning: PlanningScreen, shopping: ShoppingScreen, create: CreateScreen, profile: ProfileScreen };
  const ActiveScreen = ScreenComponents[screen];
  const FromScreen = slide ? ScreenComponents[slide.from] : null;
  const ToScreen = slide ? ScreenComponents[slide.to] : null;

  return (
    <div className="mp-phone-page">
      <style>{STYLE}</style>
      <div className="mp-phone-shell">
        <div className="mp-root">
          <main className="mp-main" onTouchStart={onTabSwipeStart} onTouchEnd={onTabSwipeEnd}
            onMouseDown={onTabSwipeMouseDown} onMouseUp={onTabSwipeMouseUp}>
            <div className="mp-topbar">
              <button className={`mp-round-btn ${screen === "profile" ? "mp-profile-active" : ""}`} onClick={() => setScreen("profile")} aria-label="Profil">
                {getInitials(data.userProfile.compte?.nom) ? (
                  <span className="mp-serif" style={{ fontSize: 14, fontWeight: 600 }}>{getInitials(data.userProfile.compte.nom)}</span>
                ) : (
                  <User size={17} />
                )}
              </button>
            </div>
            <div className="mp-slide-track">
              {slide ? (
                <>
                  <div key={slide.from} className="mp-slide-pane" style={{ transform: `translateX(${slideSettled ? -slide.dir * 100 : 0}%)` }}>
                    <FromScreen {...screenProps[slide.from]} />
                  </div>
                  <div key={slide.to} className="mp-slide-pane" style={{ transform: `translateX(${slideSettled ? 0 : slide.dir * 100}%)` }}>
                    <ToScreen {...screenProps[slide.to]} />
                  </div>
                </>
              ) : (
                <div key={screen} className="mp-slide-pane" style={{ transform: "translateX(0)", transition: "none" }}>
                  <ActiveScreen {...screenProps[screen]} />
                </div>
              )}
            </div>
          </main>
          <nav className="mp-nav" ref={navRef}>
            <div className="mp-nav-indicator-pos" style={{
              transform: `translate(${navIndicator.x}px, ${navIndicator.y}px)`,
              opacity: navIndicator.visible ? 1 : 0,
            }}>
              <div className="mp-nav-indicator-blob" />
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isCenter = item.id === "discover";
              return (
                <button key={item.id}
                  className={`mp-nav-btn ${isCenter ? "center" : ""} ${screen === item.id ? "active" : ""}`} onClick={() => setScreen(item.id)}>
                  <span className="mp-nav-icon-wrap" ref={(el) => (navIconRefs.current[item.id] = el)}><Icon size={isCenter ? 24 : 19} /></span>
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
