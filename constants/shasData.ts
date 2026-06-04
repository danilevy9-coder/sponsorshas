export type SponsorshipStatus = "available" | "sponsored";

export interface Masechta {
  name: string;
  hebrewName: string;
  pages: number;
  price: number;
  status: SponsorshipStatus;
  sponsor?: string;
}

export interface Seder {
  name: string;
  hebrewName: string;
  description: string;
  masechtot: Masechta[];
}

const PRICE_PER_DAF = 3;

function m(
  name: string,
  hebrewName: string,
  pages: number,
  status: SponsorshipStatus = "available",
  sponsor?: string
): Masechta {
  return {
    name,
    hebrewName,
    pages,
    price: pages * PRICE_PER_DAF,
    status,
    sponsor,
  };
}

export const sedorim: Seder[] = [
  {
    name: "Zeraim",
    hebrewName: "זרעים",
    description: "Seeds — Laws of blessings and agriculture",
    masechtot: [
      m("Berachos", "ברכות", 64, "sponsored", "The Goldstein Family"),
    ],
  },
  {
    name: "Moed",
    hebrewName: "מועד",
    description: "Festivals — Laws of Shabbos and holidays",
    masechtot: [
      m("Shabbos", "שבת", 157, "sponsored", "In memory of Rav Moshe ben Yaakov"),
      m("Eruvin", "עירובין", 105),
      m("Pesachim", "פסחים", 121, "sponsored", "The Schwartz Family"),
      m("Shekalim", "שקלים", 22),
      m("Yoma", "יומא", 88),
      m("Sukkah", "סוכה", 56),
      m("Beitzah", "ביצה", 40),
      m("Rosh Hashanah", "ראש השנה", 35),
      m("Taanis", "תענית", 31),
      m("Megillah", "מגילה", 32),
      m("Moed Katan", "מועד קטן", 29),
      m("Chagigah", "חגיגה", 27),
    ],
  },
  {
    name: "Nashim",
    hebrewName: "נשים",
    description: "Women — Laws of marriage and vows",
    masechtot: [
      m("Yevamos", "יבמות", 122),
      m("Kesubos", "כתובות", 112, "sponsored", "L'iluy Nishmas Sarah bas Dovid"),
      m("Nedarim", "נדרים", 91),
      m("Nazir", "נזיר", 66),
      m("Sotah", "סוטה", 49),
      m("Gittin", "גיטין", 90),
      m("Kiddushin", "קידושין", 82),
    ],
  },
  {
    name: "Nezikin",
    hebrewName: "נזיקין",
    description: "Damages — Civil and criminal law",
    masechtot: [
      m("Bava Kamma", "בבא קמא", 119),
      m("Bava Metzia", "בבא מציעא", 119, "sponsored", "The Friedman Foundation"),
      m("Bava Basra", "בבא בתרא", 176),
      m("Sanhedrin", "סנהדרין", 113),
      m("Makkos", "מכות", 24),
      m("Shevuos", "שבועות", 49),
      m("Avodah Zarah", "עבודה זרה", 76),
      m("Horayos", "הוריות", 14),
    ],
  },
  {
    name: "Kodashim",
    hebrewName: "קדשים",
    description: "Holy Things — Laws of offerings and the Temple",
    masechtot: [
      m("Zevachim", "זבחים", 120),
      m("Menachos", "מנחות", 110),
      m("Chullin", "חולין", 142, "sponsored", "Dedicated by the Katz Family"),
      m("Bechoros", "בכורות", 61),
      m("Arachin", "ערכין", 34),
      m("Temurah", "תמורה", 34),
      m("Kerisos", "כריתות", 28),
      m("Meilah", "מעילה", 22),
      m("Tamid", "תמיד", 10),
    ],
  },
  {
    name: "Taharos",
    hebrewName: "טהרות",
    description: "Purities — Laws of ritual purity",
    masechtot: [
      m("Niddah", "נדה", 73),
    ],
  },
];

// Canonical number of daf in Shas Bavli — fixed rather than summed, since the
// per-masechta page counts are last-daf numbers that don't total to this.
export const totalDaf = 2711;

export const totalSponsored = sedorim.reduce(
  (sum, seder) =>
    sum + seder.masechtot.filter((m) => m.status === "sponsored").length,
  0
);

export const totalMasechtot = sedorim.reduce(
  (sum, seder) => sum + seder.masechtot.length,
  0
);

// Price for sponsoring the whole Shas (the discounted "Best Value" offer).
export const ENTIRE_SHAS_PRICE = 6000;

// Flat list of every masechta, for lookups by name (e.g. checkout pricing).
export const allMasechtot: Masechta[] = sedorim.flatMap((s) => s.masechtot);

export function findMasechta(name: string): Masechta | undefined {
  return allMasechtot.find((m) => m.name === name);
}
