import { adminClient } from "../src/lib/supabase/admin";

const categories = [
  { order: 1, name_mn: "Олимпиад", name_en: "Olympiad", icon: "trophy" },
  { order: 2, name_mn: "Төгсөгчид", name_en: "Graduates", icon: "graduation-cap" },
  { order: 3, name_mn: "Хамт олон", name_en: "Community", icon: "users" },
  { order: 4, name_mn: "Судалгаа", name_en: "Research", icon: "microscope" },
];

for (const category of categories) {
  const record = {
    name_mn: category.name_mn,
    name_en: category.name_en,
    icon: category.icon,
    display_order: category.order,
  };

  const { data: existing, error: findError } = await adminClient
    .from("achievement_categories")
    .select("id")
    .eq("display_order", category.order)
    .maybeSingle();
  if (findError) throw findError;

  const query = existing
    ? adminClient.from("achievement_categories").update(record).eq("id", existing.id)
    : adminClient.from("achievement_categories").insert(record);
  const { error } = await query;
  if (error) throw error;
}

const { data: categoryRows, error: categoryError } = await adminClient
  .from("achievement_categories")
  .select("*");
if (categoryError) throw categoryError;

const { data: yearRows, error: yearError } = await adminClient
  .from("achievement_years")
  .select("*");
if (yearError) throw yearError;

const categoryByName = new Map(categoryRows.map(row => [row.name_mn, row.id]));
const yearByNumber = new Map(yearRows.map(row => [row.year, row.id]));

const achievements = [
  [2024, "Олимпиад", "Математикийн улсын олимпиад — Алтан медаль", "Д. Номин 11-р ангийн сурагч улсын тэмцээнд тэргүүлсэн"],
  [2024, "Олимпиад", "Физикийн олимпиад — Мөнгөн медаль", "Манай сургуулийн сурагч физикийн улсын олимпиадад мөнгөн медаль хүртсэн"],
  [2024, "Төгсөгчид", "100% Төгсөлт — Бүх сурагч амжилттай төгссөн", "Бүх сурагч амжилттай төгссөн анхны жил"],
  [2023, "Судалгаа", "БНСУ-ын сургуультай хамтын ажиллагаа", "Олон улсын хамтын ажиллагааны хөтөлбөр эхэлсэн"],
  [2023, "Хамт олон", "Олон улсын соёлын арга хэмжээ", "Сурагчид олон улсын соёлын солилцооны арга хэмжээнд оролцсон"],
  [2022, "Хамт олон", "Ногоон сургуулийн шагнал — 1-р байр", "Экологийн хамгааллаар улсдаа тэргүүлсэн"],
  [2021, "Олимпиад", "Роботикийн улсын тэмцээн — Аварга", "STEAM клубын сурагчид улсын тэмцээнд ялсан"],
  [2019, "Олимпиад", "Урлагийн олимпиад — Гран-при", "Улсын урлагийн олимпиадад гран-при шагнал хүртсэн"],
  [2016, "Хамт олон", "Шинэ хичээлийн байр нээгдсэн", "Орчин үеийн лаборатори, номын сантай болсон"],
] as const;

for (let index = 0; index < achievements.length; index++) {
  const [year, category, title_mn, description_mn] = achievements[index];
  const year_id = yearByNumber.get(year);
  const category_id = categoryByName.get(category);
  if (!year_id || !category_id) continue;

  const { data: existing, error: findError } = await adminClient
    .from("achievements")
    .select("id")
    .eq("year_id", year_id)
    .eq("title_mn", title_mn)
    .maybeSingle();
  if (findError) throw findError;

  const record = {
    year_id,
    category_id,
    title_mn,
    description_mn,
    is_published: true,
    display_order: index + 1,
  };

  const query = existing
    ? adminClient.from("achievements").update(record).eq("id", existing.id)
    : adminClient.from("achievements").insert(record);
  const { error } = await query;
  if (error) throw error;
}

console.log("Achievement categories and records seeded.");
