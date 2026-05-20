import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock3,
  Facebook,
  FileText,
  GraduationCap,
  HeartHandshake,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Music,
  Phone,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Youtube,
} from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminApp, AdminLogin } from "@/AdminApp";
import type { AchievementYear, CourseSection, NewsArticle, SchoolSettings, Teacher } from "@/types/database";
import schoolBg from "../public/school-bg.jpg";
import applicationGuide from "../public/application-guide.pdf";
import "./index.css";

type Page = "home" | "about" | "achievements" | "courses" | "apply";
type ResultState = "idle" | "success" | "pending" | "not-found" | "invalid";
type UiNews = {
  id: string | number;
  category: string;
  date: string;
  headline: string;
  excerpt: string;
  body: string;
  image: string;
  author: string;
  authorRole: string;
  readTime: string;
  tags: string[];
};
type UiTeacher = { name: string; subject: string; years: string; photo?: string | null };
type UiAchievementItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
};
type UiAchievement = {
  id: string;
  year: string;
  label: string;
  detail: string;
  tag: string;
  image: string | null;
  isMilestone: boolean;
  achievements: UiAchievementItem[];
};

const pages: { id: Page; label: string }[] = [
  { id: "home", label: "Нүүр" },
  { id: "about", label: "Бидний тухай" },
  { id: "achievements", label: "Амжилт" },
  { id: "courses", label: "Сургалт" },
  { id: "apply", label: "Элсэлт" },
];

const pagePaths: Record<Page, string> = {
  home: "/",
  about: "/about",
  achievements: "/achievements",
  courses: "/courses",
  apply: "/apply",
};

const pathPages: Record<string, Page> = {
  "/": "home",
  "/about": "about",
  "/achievements": "achievements",
  "/courses": "courses",
  "/apply": "apply",
};

const defaultSchoolSettings: SchoolSettings = {
  school_name_mn: "Нийслэлийн 11-р сургууль",
  school_name_en: "11th School",
  established: 1940,
  student_count: 2000,
  teacher_count: 80,
  club_count: 40,
  address_mn: "Партизаны гудамж, Сүхбаатар дүүрэг",
  city: "Улаанбаатар",
  phone: "+976 11 327226",
  email: "School_11@edub.edu.mn",
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  twitter_url: null,
};

const fallbackNews: UiNews[] = [
  {
    id: 1,
    category: "Олимпиад",
    date: "2024 оны 5-р сарын 12",
    headline: "Математикийн олимпиадад тэргүүн байр эзэллээ",
    excerpt: "Манай сургуулийн сурагчид улсын олимпиадад өндөр амжилт үзүүллээ...",
    body: "Манай сургуулийн сурагчид улсын хэмжээний математикийн олимпиадад амжилттай оролцож, бодлогын гүнзгий ойлголт, багийн сахилга, тууштай бэлтгэлийн үр дүнгээ харууллаа. Энэхүү амжилт нь сурагч, багш, эцэг эхийн хамтын ажиллагаа ямар хүчтэй үр дүн авчирдгийн тод жишээ боллоо.",
    image: "linear-gradient(135deg, #0a1628 0%, #1a3a7c 55%, #f59e0b 100%)",
    author: "Б. Оюунтуяа",
    authorRole: "Математикийн багш",
    readTime: "5 мин унших",
    tags: ["Олимпиад", "Математик", "Амжилт"],
  },
  {
    id: 2,
    category: "Арга хэмжээ",
    date: "2024 оны 5-р сарын 8",
    headline: "80 жилийн ойд зориулсан түүхэн материал цуглуулах ажил эхэллээ",
    excerpt: "Сургуулийн түүхэн замналыг баримтжуулах ажилд төгсөгчид, багш нар нэгдэж байна...",
    body: "Нийслэлийн 11-р сургуулийн түүхэн ойд зориулан үе үеийн төгсөгчид, ахмад багш нар, сурагчдын дурсамж, гэрэл зураг, баримтат материалыг нэгтгэх ажил эхэллээ. Энэхүү сан нь сургуулийн үнэ цэн, уламжлалыг дараагийн үед өвлүүлэх зорилготой.",
    image: "linear-gradient(135deg, #03071e 0%, #0d2149 48%, #0891b2 100%)",
    author: "Сургалтын алба",
    authorRole: "Захиргаа",
    readTime: "4 мин унших",
    tags: ["Түүх", "Ой", "Сургууль"],
  },
  {
    id: 3,
    category: "Клуб",
    date: "2024 оны 5-р сарын 2",
    headline: "Шинжлэх ухаан, урлаг, спортын дугуйлангууд шинэ элсэлт авч байна",
    excerpt: "Сурагчдын сонирхол, авьяасыг хөгжүүлэх олон төрлийн клубүүд бүртгэлээ нээлээ...",
    body: "Шинжлэх ухаан, урлаг, спорт, технологийн чиглэлийн дугуйлангууд шинэ гишүүдээ бүртгэж эхэллээ. Дугуйлан бүр сурагчдын өөрийгөө илэрхийлэх чадвар, багаар ажиллах соёл, бүтээлч сэтгэлгээг хөгжүүлэхээр төлөвлөгдсөн.",
    image: "linear-gradient(135deg, #0d2149 0%, #1a3a7c 52%, #fcd34d 100%)",
    author: "Нийгмийн ажилтан",
    authorRole: "Хөгжлийн баг",
    readTime: "3 мин унших",
    tags: ["Клуб", "Сурагч", "Хөгжил"],
  },
  {
    id: 4,
    category: "Спорт",
    date: "2024 оны 4-р сарын 28",
    headline: "Сургуулийн аварга шалгаруулах спортын өдөрлөг боллоо",
    excerpt: "Ангиудын багууд хурд, хүч, зохион байгуулалтаараа өрсөлдөв...",
    body: "Спортын өдөрлөгөөр сурагчид багийн ажиллагаа, тэсвэр, шударга өрсөлдөөний соёлыг харууллаа. Тэмцээнүүдийг багш нар болон сурагчдын зөвлөл хамтран зохион байгуулж, шилдэг багуудыг шагнаж урамшууллаа.",
    image: "linear-gradient(135deg, #03071e 0%, #0891b2 48%, #1a3a7c 100%)",
    author: "Г. Бат",
    authorRole: "Дасгалжуулагч",
    readTime: "4 мин унших",
    tags: ["Спорт", "Баг", "Өдөрлөг"],
  },
  {
    id: 5,
    category: "Урлаг",
    date: "2024 оны 4-р сарын 21",
    headline: "Урлагийн студийн сурагчид тайзны шинэ бүтээлээ толилууллаа",
    excerpt: "Найрал дуу, хөгжим, тайзны хөдөлгөөнийг нэгтгэсэн тоглолт үзэгчдэд хүрэв...",
    body: "Урлагийн студийн сурагчид улирлын тайлан тоглолтоо зохион байгуулж, тайзны соёл, бүтээлч багийн ажиллагаагаа харууллаа. Тоглолт нь сурагчдын өөртөө итгэх итгэл, соёлын мэдрэмжийг нэмэгдүүлэх зорилготой.",
    image: "linear-gradient(135deg, #1a3a7c 0%, #03071e 55%, #f59e0b 100%)",
    author: "О. Солонго",
    authorRole: "Урлагийн багш",
    readTime: "3 мин унших",
    tags: ["Урлаг", "Тайз", "Студи"],
  },
  {
    id: 6,
    category: "Шинэ мэдээ",
    date: "2024 оны 4-р сарын 15",
    headline: "Лабораторийн шинэчлэл сургалтын орчныг өргөжүүллээ",
    excerpt: "Туршилт, судалгаанд суурилсан хичээлийн боломж нэмэгдэв...",
    body: "Сургалтын лабораторийн тоног төхөөрөмжийг шинэчилснээр сурагчид туршилтаар суралцах, хэмжилт хийх, судалгааны арга барил эзэмших боломж илүү өргөн боллоо. Энэ нь STEM чиглэлийн сургалтын чанарыг ахиулах нэг алхам юм.",
    image: "linear-gradient(135deg, #0a1628 0%, #2563eb 48%, #0891b2 100%)",
    author: "STEM баг",
    authorRole: "Сургалтын нэгж",
    readTime: "5 мин унших",
    tags: ["STEM", "Лаборатори", "Сургалт"],
  },
];

const fallbackTeachers: UiTeacher[] = [
  { name: "Д. Наранцэцэг", subject: "Математик", years: "18 жил" },
  { name: "Б. Энхбаяр", subject: "Физик", years: "12 жил" },
  { name: "О. Мөнхзул", subject: "Биологи", years: "9 жил" },
  { name: "Г. Батбаяр", subject: "Түүх", years: "15 жил" },
  { name: "Х. Солонго", subject: "Хими", years: "7 жил" },
  { name: "Т. Оюун", subject: "Англи хэл", years: "11 жил" },
  { name: "Э. Батзориг", subject: "Монгол хэл", years: "20 жил" },
  { name: "Н. Цэрэндулам", subject: "Урлаг", years: "8 жил" },
];

const fallbackAchievements: UiAchievement[] = [
  { id: "1947", year: "1947", label: "Үүсгэн байгуулагдсан", detail: "Нийслэлийн боловсролын салбарт математик, байгалийн ухааны чиглэлээр ялгарах сууриа тавьсан.", tag: "Түүх", image: null, isMilestone: true, achievements: [] },
  { id: "1989", year: "1989", label: "Гүнзгийрүүлсэн сургалт", detail: "Математик, физикийн сонгон сургалт тогтмолжиж, олимпиадын багш-сурагчийн систем бүрэлдсэн.", tag: "Сургалт", image: null, isMilestone: true, achievements: [] },
  { id: "2016", year: "2016", label: "Шинэ байр", detail: "Орчин үеийн сургалтын орчинтой шинэ хичээлийн байр ашиглалтад орж, лаборатори, танхимын хүртээмж сайжирсан.", tag: "Кампус", image: null, isMilestone: true, achievements: [] },
  { id: "2026", year: "2026", label: "Олон улсын гараа", detail: "Сурагчдын судалгааны төслүүд олон улсын уралдаанд шалгарч, ахлах ангийн академик соёл улам бэхжив.", tag: "Олон улс", image: null, isMilestone: false, achievements: [] },
];

const clubs = [
  { name: "Математик олимпиад", one: "Бодлогын арга зүй, нотолгооны соёл.", teacher: "Багш: Э.Хүдэрбаатар", schedule: "Мягмар, Пүрэв 15:30" },
  { name: "Физик судалгаа", one: "Туршилт, хэмжилт, инженерчлэлийн суурь.", teacher: "Багш: Б.Эрдэнэ", schedule: "Даваа, Лхагва 16:00" },
  { name: "Роботик ба код", one: "Алгоритм, электроник, багийн төсөл.", teacher: "Багш: Д.Номин", schedule: "Баасан 15:00" },
  { name: "Урлагийн студи", one: "Найрал дуу, хөгжим, тайзны соёл.", teacher: "Багш: О.Солонго", schedule: "Лхагва 15:30" },
];

const fallbackCourseSections = [
  {
    id: "section-секц",
    key: "секц",
    icon: BookOpen,
    title: "Секц",
    description: "Математик, физик, хэлний сонгон сургалт",
    heading: "Секц ба дугуйлан",
    items: clubs,
  },
  {
    id: "section-календар",
    key: "календар",
    icon: CalendarDays,
    title: "Календар",
    description: "Сорил, тэмцээн, хичээлийн үйл ажиллагаа",
    heading: "Календар",
    items: [
      { name: "Олимпиадын сорил", one: "Сарын нэгдсэн сорилын хуваарь.", teacher: "Хариуцагч: Сургалтын алба", schedule: "Сар бүрийн эхний Баасан" },
      { name: "Төслийн хамгаалалт", one: "Судалгааны ажлын явцын танилцуулга.", teacher: "Хариуцагч: STEM баг", schedule: "Улирал бүр" },
      { name: "Эцэг эхийн өдөр", one: "Суралцахуйн ахицын уулзалт.", teacher: "Хариуцагч: Анги удирдсан багш", schedule: "Бямба 10:00" },
    ],
  },
  {
    id: "section-олимпиад",
    key: "олимпиад",
    icon: Trophy,
    title: "Олимпиад",
    description: "Бэлтгэлийн шаталсан төлөвлөгөө",
    heading: "Олимпиад",
    items: [
      { name: "Математик бэлтгэл", one: "Аймаг, нийслэл, улсын түвшний бодлого.", teacher: "Багш: Э.Хүдэрбаатар", schedule: "Даваа, Пүрэв 16:20" },
      { name: "Физик бэлтгэл", one: "Туршилт, тооцоолол, загварчлал.", teacher: "Багш: Б.Эрдэнэ", schedule: "Мягмар 16:00" },
      { name: "Мэдээлэл зүйн бэлтгэл", one: "Алгоритм, өгөгдлийн бүтэц, бодлого.", teacher: "Багш: Д.Номин", schedule: "Баасан 15:30" },
    ],
  },
  {
    id: "section-клуб",
    key: "клуб",
    icon: Users,
    title: "Клуб",
    description: "Сурагчдын хөгжлийн орчин",
    heading: "Клуб",
    items: [
      { name: "Роботик ба код", one: "Алгоритм, электроник, багийн төсөл.", teacher: "Багш: Д.Номин", schedule: "Баасан 15:00" },
      { name: "Урлагийн студи", one: "Найрал дуу, хөгжим, тайзны соёл.", teacher: "Багш: О.Солонго", schedule: "Лхагва 15:30" },
      { name: "Илтгэх урлаг", one: "Судалгаа, мэтгэлцээн, тайзны илтгэл.", teacher: "Багш: Б.Тэмүүлэн", schedule: "Пүрэв 15:30" },
      { name: "Сагсан бөмбөг", one: "Багийн тоглолт, тэсвэр, сахилга.", teacher: "Дасгалжуулагч: Г.Бат", schedule: "Мягмар, Баасан 17:00" },
    ],
  },
];

function usePage() {
  const initial = () => {
    return pathPages[window.location.pathname] || "home";
  };
  const [page, setPage] = useState<Page>(initial);

  useEffect(() => {
    const onPop = () => setPage(initial());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (next: Page) => {
    window.history.pushState(null, "", pagePaths[next]);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { page, navigate };
}

function Header({ page, navigate }: { page: Page; navigate: (page: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (next: Page) => {
    navigate(next);
    setOpen(false);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <button className="brand" onClick={() => go("home")} aria-label="Нүүр хуудас">
        <span className="brand-mark"><School size={28} /></span>
        <span><strong>11-р сургууль</strong><small>Нийслэлийн ерөнхий боловсрол</small></span>
      </button>
      <nav className="desktop-nav" aria-label="Үндсэн цэс">
        {pages.map(item => (
          <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => go(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <button className="apply-pill" onClick={() => go("apply")}>Apply</button>
      <button className="mobile-toggle" onClick={() => setOpen(true)} aria-label="Цэс нээх"><Menu /></button>
      <div className={`mobile-panel ${open ? "open" : ""}`}>
        <button className="panel-close" onClick={() => setOpen(false)} aria-label="Цэс хаах"><X /></button>
        {pages.map(item => (
          <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => go(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function Home({
  navigate,
  newsItems,
  teacherItems,
  settings,
}: {
  navigate: (page: Page) => void;
  newsItems: UiNews[];
  teacherItems: UiTeacher[];
  settings: SchoolSettings;
}) {
  const [selectedNews, setSelectedNews] = useState<UiNews | null>(null);
  const [showAllNews, setShowAllNews] = useState(false);
  const scrollToNews = () => document.getElementById("news")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const visibleNews = showAllNews ? newsItems : newsItems.slice(0, 3);

  return (
    <main className="page page-home">
      <section className="hero editorial-hero" style={{ backgroundImage: `linear-gradient(to right, rgba(3,7,30,0.92) 0%, rgba(3,7,30,0.7) 50%, rgba(3,7,30,0.3) 100%), url(${schoolBg})` }}>
        <div className="hero-inner reveal">
          <span className="eyebrow">НИЙСЛЭЛИЙН · EST. 1940</span>
          <h1><span>11-р</span> <em>сургууль</em></h1>
          <p>Таны амжилтын аялал эндээс эхэлнэ</p>
          <div className="hero-actions">
            <button className="btn gold" onClick={() => navigate("apply")}>Элсэх</button>
            <button className="btn outline" onClick={() => navigate("about")}>Бидний тухай</button>
          </div>
          <div className="hero-microstats">
            <span><strong className="gold-glow-text">{settings.student_count}+</strong> сурагч</span>
            <span><strong className="gold-glow-text">{settings.teacher_count}+</strong> багш</span>
            <span><strong className="gold-glow-text">{new Date().getFullYear() - settings.established}</strong> жил</span>
          </div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="hero-logo"><School size={108} /></div>
        </div>
        <button className="scroll-cue" onClick={scrollToNews} aria-label="Мэдээ хэсэг рүү очих">
          <span>ДООШ</span>
          <i />
        </button>
      </section>
      <section className="stats-bar">
        {[
          [`${settings.student_count}+`, "Сурагчид"],
          [`${settings.teacher_count}+`, "Багш нар"],
          [`${settings.club_count}+`, "Дугуйлан"],
        ].map(([number, label]) => <div className="stat" key={label}><strong>{number}</strong><span>{label}</span></div>)}
      </section>
      <section id="news" className="section news-section reveal">
        <div className="section-head">
          <div>
            <span className="section-number">01 — МЭДЭЭ</span>
            <div className="section-kicker"><i />МЭДЭЭ МЭДЭЭЛЭЛ</div>
            <h2><span>Сүүлийн</span> мэдээ</h2>
          </div>
          <button className="all-link" onClick={() => setShowAllNews(prev => !prev)}>
            {showAllNews ? "Хураах" : "Бүгдийг харах"} →
          </button>
        </div>
        <div className="news-grid editorial-news-grid">
          {visibleNews.map((item, index) => (
            <article className={`news-card ${index === 0 ? "featured" : ""}`} key={item.id} onClick={() => setSelectedNews(item)}>
              <div className="news-image" style={{ background: item.image }}>
                <span>{index === 0 ? "NEW · " : ""}{item.category}</span>
              </div>
              <div className="news-body">
                <div className="meta"><CalendarDays size={15} /> {item.date} · {item.readTime}</div>
                <h3>{item.headline}</h3>
                <p>{item.excerpt}</p>
                <button className="text-link" onClick={event => { event.stopPropagation(); setSelectedNews(item); }}>Унших →</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <TeachersCarousel teachers={teacherItems} />
      <section className="section courses-teaser reveal">
        <div className="section-head right">
          <div>
            <span className="section-number">03 — АКАДЕМИК</span>
            <div className="section-kicker"><i />АКАДЕМИК</div>
            <h2><span>Сургалтын</span> чиглэл</h2>
          </div>
        </div>
        <div className="teaser-grid">
          {[
            [BookOpen, "Секц", "Сонгон гүнзгийрүүлсэн сургалт"],
            [Microscope, "Лаборатори", "Туршилт ба судалгааны арга"],
            [Trophy, "Олимпиад", "Бэлтгэл, сорил, зөвлөмж"],
            [Music, "Дугуйлан", "Урлаг, спорт, технологи"],
          ].map(([Icon, title, desc]) => (
            <button className="teaser-card" key={String(title)} onClick={() => navigate("courses")}>
              <span><Icon size={28} /></span><strong>{String(title)}</strong><small>{String(desc)}</small><b>→</b>
            </button>
          ))}
        </div>
      </section>
      {selectedNews && <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />}
    </main>
  );
}

function NewsModal({ item, onClose }: { item: UiNews; onClose: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal news-overlay"
      onClick={onClose}
      onTouchStart={event => setTouchStart(event.touches[0]?.clientY ?? null)}
      onTouchEnd={event => {
        const end = event.changedTouches[0]?.clientY;
        if (touchStart !== null && end && end - touchStart > 80) onClose();
      }}
    >
      <article className="news-modal editorial-modal" onClick={event => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Хаах"><X /></button>
        <div className="modal-hero" style={{ background: item.image }} />
        <div className="modal-content">
          <div className="modal-meta"><span>{item.category}</span><small>{item.date} · {item.readTime}</small></div>
          <h2>{item.headline}</h2>
          <div className="author-row"><b>{item.author.slice(0, 1)}</b><span>{item.author} · {item.authorRole}</span></div>
          <hr />
          <p>{item.body}</p>
          <div className="tag-row">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
      </article>
    </div>
  );
}

function TeachersCarousel({ teachers }: { teachers: UiTeacher[] }) {
  const doubled = [...teachers, ...teachers];
  return (
    <section className="section teachers-section reveal">
      <div className="section-head">
        <div>
          <span className="section-number">02 — БАГШ НАР</span>
          <div className="section-kicker"><i />МАНАЙ БАГШ НАР</div>
          <h2><span>Мэргэжлийн</span> баг</h2>
          <p>Туршлагатай, х献身적인 багш нарын хамт</p>
        </div>
      </div>
      <div className="teacher-marquee" aria-label="Багш нарын жагсаалт">
        <div className="teacher-track">
          {doubled.map((teacher, index) => (
            <article className="teacher-card" key={`${teacher.name}-${index}`}>
              <div className="teacher-photo" aria-hidden="true">
                {teacher.photo ? <img src={teacher.photo} alt="" /> : getInitials(teacher.name)}
              </div>
              <h3>{teacher.name}</h3>
              <span>{teacher.subject}</span>
              <small>Туршлага: {teacher.years}</small>
              {index === 0 && <b>NEW</b>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2);
}

function About({ settings }: { settings: SchoolSettings }) {
  return (
    <main className="page page-about reveal">
      <PageTitle label="БИДНИЙ ТУХАЙ" title="Our School" />
      <section className="narrow about-content">
        <div className="story-block">
          <span>Манай сургууль</span>
          <h3>Математик, байгалийн ухааны соёлыг төлөвшүүлэгч сургууль</h3>
          <p>Нийслэлийн 11-р сургууль нь сурагч бүрийн академик сахилга, бүтээлч сэтгэлгээ, нийгмийн хариуцлагыг зэрэг хөгжүүлэхийг зорьдог. Бид сургалтын чанар, багшийн арга зүй, сурагчийн судалгааны оролцоог нэг систем болгон хөгжүүлдэг.</p>
        </div>
        <div className="mission-grid">
          <InfoCard icon={Target} title="Mission" text="Суралцахуйн өндөр стандарт, ёс зүй, хамтын ажиллагаанд тулгуурлан ирээдүйн манлайлагчдыг бэлтгэнэ." />
          <InfoCard icon={Sparkles} title="Vision" text="Монголын ерөнхий боловсролын шилдэг академик кампус болж, олон улсын түвшний сурагчдыг төлөвшүүлнэ." />
        </div>
        <div className="value-grid">
          <InfoCard icon={BookOpen} title="Эрдэм" text="Гүн ойлголт, нотолгоо, тасралтгүй суралцах дадал." compact />
          <InfoCard icon={HeartHandshake} title="Хүндлэл" text="Багш, сурагч, гэр бүлийн итгэлцэл." compact />
          <InfoCard icon={Star} title="Манлайлал" text="Хариуцлагатай санаачилга, үр дүн." compact />
          <InfoCard icon={ShieldCheck} title="Ёс зүй" text="Шударга байдал, сургалтын соёл." compact />
        </div>
        <Timeline />
        <div className="contact-grid contact-links">
          <a className="info-card contact-card" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address_mn}, ${settings.city}`)}`} target="_blank" rel="noreferrer"><MapPin size={30} /><h3>Location</h3><p>{settings.address_mn}, {settings.city}</p></a>
          <a className="info-card contact-card" href={`tel:${settings.phone.replace(/\s/g, "")}`}><Phone size={30} /><h3>Phone</h3><p>{settings.phone}</p></a>
          <a className="info-card contact-card" href={`mailto:${settings.email}`}><Mail size={30} /><h3>Email</h3><p>{settings.email}</p></a>
        </div>
        <div className="map-placeholder"><MapPin size={38} /><span>Сургуулийн байршлын зураглал</span></div>
      </section>
    </main>
  );
}

function Achievements({ achievements }: { achievements: UiAchievement[] }) {
  const [active, setActive] = useState(Math.max(0, achievements.length - 1));
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ dragging: false, startX: 0, scrollLeft: 0 });
  const current = achievements[active];
  const grouped = useMemo(() => {
    const groups = new Map<string, UiAchievementItem[]>();
    for (const item of current?.achievements || []) {
      const key = item.category.name;
      groups.set(key, [...(groups.get(key) || []), item]);
    }
    return Array.from(groups.entries());
  }, [current]);

  useEffect(() => {
    setActive(Math.max(0, achievements.length - 1));
  }, [achievements]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    requestAnimationFrame(() => {
      node.scrollLeft = node.scrollWidth;
    });
  }, [achievements.length]);

  const startDrag = (event: MouseEvent<HTMLDivElement>) => {
    const node = scrollerRef.current;
    if (!node) return;
    dragRef.current = {
      dragging: true,
      startX: event.pageX - node.offsetLeft,
      scrollLeft: node.scrollLeft,
    };
  };

  const drag = (event: MouseEvent<HTMLDivElement>) => {
    const node = scrollerRef.current;
    if (!node || !dragRef.current.dragging) return;
    event.preventDefault();
    const x = event.pageX - node.offsetLeft;
    node.scrollLeft = dragRef.current.scrollLeft - (x - dragRef.current.startX);
  };

  if (!current) return null;
  return (
    <main className="page page-achievements reveal">
      <section className="achievement-hero">
        <PageTitle label="OUR ACHIEVEMENTS" title="Амжилтын замнал" subtitle="Олимпиад, судалгаа, сургалтын чанараар хэмжигдэх олон жилийн итгэл." />
        <div className="greeting-card">Эрдэм, сахилга, хамтын хүчээр 11-р сургууль үе үеийн шилдэг сурагчдыг төрүүлсээр байна.</div>
      </section>
      <section className="timeline-wrap">
        <div
          className="timeline-container"
          ref={scrollerRef}
          onMouseDown={startDrag}
          onMouseMove={drag}
          onMouseUp={() => { dragRef.current.dragging = false; }}
          onMouseLeave={() => { dragRef.current.dragging = false; }}
        >
          <div className="timeline-track">
            <div className="timeline-line" />
          {achievements.map((item, index) => (
            <button className={`timeline-year ${index === active ? "active" : ""} ${item.isMilestone ? "milestone" : ""}`} key={item.id} onClick={() => setActive(index)}>
              <strong>{item.year}</strong>
              <small>{item.label}</small>
              <span />
            </button>
          ))}
          </div>
        </div>
        <article className="achievement-detail" key={current.year}>
          <div className="achievement-detail-top">
            <strong>{current.year}</strong>
            {current.isMilestone && <span><Star size={15} /> Түүхэн үйл явдал</span>}
          </div>
          <div className="achievement-highlight">
            <h3>{current.label}</h3>
            <p>{current.detail}</p>
          </div>
          <hr />
          {grouped.length ? (
            <div className="achievement-record-grid">
              {grouped.map(([category, records]) => (
                <section className="achievement-record-group" key={category}>
                  <h4>{categoryIcon(category)}{category}</h4>
                  {records.map(record => (
                    <article className="achievement-record" key={record.id}>
                      <Trophy size={22} />
                      <div>
                        <h5>{record.title}</h5>
                        <p>{record.description}</p>
                      </div>
                      {record.image && <img src={record.image} alt="" />}
                    </article>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <p className="achievement-empty">Энэ жилийн мэдээлэл удахгүй нэмэгдэнэ</p>
          )}
        </article>
      </section>
      <section className="achievement-cats">
        {[
          [Award, "Олимпиад", ["Улсын түвшний медаль", "Бүсийн аваргууд", "Судалгааны уралдаан"]],
          [GraduationCap, "Төгсөгчид", ["Их дээд сургуулийн элсэлт", "Мэргэжлийн манлайлал", "Олон улсын тэтгэлэг"]],
          [Users, "Хамт олон", ["Заах арга зүйн баг", "Эцэг эхийн оролцоо", "Сурагчийн зөвлөл"]],
          [Microscope, "Судалгаа", ["STEM төсөл", "Лабораторийн ажил", "Инновацийн клуб"]],
        ].map(([Icon, title, list]) => (
          <div className="cat-card" key={String(title)}>
            <Icon size={32} /><h3>{String(title)}</h3>
            {(list as string[]).map(item => <p key={item}>→ {item}</p>)}
          </div>
        ))}
      </section>
    </main>
  );
}

function Courses({ sections }: { sections: typeof fallbackCourseSections }) {
  const [open, setOpen] = useState(`${sections[0]?.id || "section-секц"}-0`);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "section-секц");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.45, 0.7] });
    sections.forEach(section => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    const title = target.querySelector("h2");
    title?.classList.remove("flash");
    window.setTimeout(() => title?.classList.add("flash"), 20);
  };

  return (
    <main className="page page-courses reveal">
      <PageTitle label="СУРГАЛТ" title="Сургалтын орчин ба клубүүд" subtitle="Гүнзгийрүүлсэн хичээл, лаборатори, олимпиад, сонирхлын дугуйлан нэг системд." />
      <section className="course-nav">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              className={`course-nav-card ${activeSection === section.id ? "active" : ""}`}
              key={section.id}
              onClick={() => scrollToSection(section.id)}
            >
              <Icon size={30} />
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </button>
          );
        })}
      </section>
      <div className="course-sections">
        {sections.map(section => {
          const showAll = expanded[section.id];
          const visibleItems = showAll ? section.items : section.items.slice(0, 2);
          return (
            <section className="course-section" id={section.id} key={section.id}>
              <h2>{section.heading}</h2>
              <div className="club-list">
                {visibleItems.map((club, index) => {
                  const cardId = `${section.id}-${index}`;
                  return (
                    <button className={`club-card ${open === cardId ? "open" : ""}`} key={club.name} onClick={() => setOpen(open === cardId ? "" : cardId)}>
                      <span><strong>{club.name}</strong><small>{club.one}</small></span><b>+</b>
                      <div><p>{club.teacher}</p><p>{club.schedule}</p></div>
                    </button>
                  );
                })}
              </div>
              {section.items.length > 2 && (
                <button className="btn gold show-all" onClick={() => setExpanded(prev => ({ ...prev, [section.id]: !prev[section.id] }))}>
                  {showAll ? "Хураах" : "Бүгдийг харуулах"}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}

function Apply() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const check = async () => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 8) {
      setResult("invalid");
      setResultMessage(null);
      return;
    }

    try {
      const response = await fetch("/api/check-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });

      if (!response.ok) {
        setResult("not-found");
        setResultMessage(null);
        return;
      }

      const payload = await response.json() as { status: string; message_mn?: string | null };
      setResultMessage(payload.message_mn || null);
      if (payload.status === "accepted") setResult("success");
      else if (payload.status === "rejected") setResult("not-found");
      else setResult("pending");
    } catch (error) {
      console.error("Application lookup failed:", error);
      setResult("not-found");
      setResultMessage(null);
    }
  };
  const state = useMemo(() => ({
    success: [CheckCircle2, "Тэнцсэн", resultMessage || "Таны бүртгэл баталгаажсан байна."],
    pending: [Clock3, "Хүлээгдэж байна", resultMessage || "Материал шалгах шатанд байна."],
    "not-found": [CircleX, "Олдсонгүй", resultMessage || "Кодоо дахин шалгана уу."],
    invalid: [CircleX, "Код буруу", "Код хоосон биш, яг 8 тэмдэгттэй байх ёстой."],
  }[result] || null), [result, resultMessage]);

  return (
    <main className="page page-apply reveal">
      <PageTitle label="ЭЛСЭЛТ" title="Application Guides" subtitle="Элсэлтийн материал, хугацаа, баталгаажуулалтын дарааллыг нэг дороос харна уу." />
      <section className="apply-grid">
        <article className="pdf-card">
          <h3><FileText size={22} /> Элсэлтийн гарын авлага</h3>
          <object data={applicationGuide} type="application/pdf" aria-label="Элсэлтийн гарын авлага">
            <a href={applicationGuide}>PDF татаж авах</a>
          </object>
          <a className="download-link" href={applicationGuide} download>PDF татаж авах</a>
        </article>
        <article className="checker-card">
          <h3>Элсэлтийн үр дүн шалгах</h3>
          <label>8 тэмдэгттэй код</label>
          <div className="code-input">
            <Search size={18} />
            <input value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="SCH11001" maxLength={8} />
          </div>
          <button className="btn gold full" onClick={check}>Шалгах</button>
          {state && <Result state={result} data={state as [typeof CheckCircle2, string, string]} />}
        </article>
      </section>
    </main>
  );
}

function PageTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return <div className="page-title"><span>{label}</span><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}

function InfoCard({ icon: Icon, title, text, compact = false }: { icon: typeof BookOpen; title: string; text: string; compact?: boolean }) {
  return <article className={`info-card ${compact ? "compact" : ""}`}><Icon size={30} /><h3>{title}</h3><p>{text}</p></article>;
}

function Timeline() {
  return <div className="vertical-timeline">{["1947 · Сургууль байгуулагдав", "1989 · Гүнзгийрүүлсэн сургалт өргөжив", "2016 · Шинэ хичээлийн байр нээгдэв", "2027 · 80 жилийн ойн бэлтгэл"].map(item => <p key={item}><span />{item}</p>)}</div>;
}

function Result({ state, data }: { state: ResultState; data: [typeof CheckCircle2, string, string] }) {
  const [Icon, title, text] = data;
  return <div className={`result ${state}`}><Icon size={22} /><span><strong>{title}</strong><small>{text}</small></span></div>;
}

function formatDate(date: string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("mn-MN", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

function mapNewsArticles(items: NewsArticle[]): UiNews[] {
  return items.map((item, index) => ({
    id: item.id,
    category: item.category?.name_mn || "Шинэ мэдээ",
    date: formatDate(item.published_at),
    headline: item.title_mn,
    excerpt: item.excerpt_mn || "",
    body: item.body_mn || item.excerpt_mn || "",
    image: item.cover_image_url ? `url(${item.cover_image_url})` : fallbackNews[index % fallbackNews.length]?.image || fallbackNews[0].image,
    author: item.author_name,
    authorRole: item.author_role || "Захиргаа",
    readTime: `${item.read_time_min || 3} мин унших`,
    tags: item.tags || [],
  }));
}

function mapTeachers(items: Teacher[]): UiTeacher[] {
  return items.map(item => ({
    name: item.name_mn,
    subject: item.subject_mn,
    years: `${item.years_exp} жил`,
    photo: item.photo_url,
  }));
}

function iconForCourse(icon: string | null | undefined) {
  if (icon === "calendar") return CalendarDays;
  if (icon === "trophy") return Trophy;
  if (icon === "users") return Users;
  return BookOpen;
}

function mapCourseSections(items: CourseSection[]): typeof fallbackCourseSections {
  return items.map(item => ({
    id: `section-${item.title_mn.toLowerCase()}`,
    key: item.slug,
    icon: iconForCourse(item.icon),
    title: item.title_mn,
    description: item.description_mn || "",
    heading: item.title_mn === "Секц" ? "Секц ба дугуйлан" : item.title_mn,
    items: (item.items || []).map(course => ({
      name: course.title_mn,
      one: course.short_desc_mn || "",
      teacher: course.teacher_name ? `Багш: ${course.teacher_name}` : course.full_desc_mn || "",
      schedule: course.schedule_mn || course.location_mn || "",
    })),
  }));
}

function mapAchievements(items: AchievementYear[]): UiAchievement[] {
  return [...items].sort((a, b) => a.year - b.year).map(item => ({
    id: item.id,
    year: String(item.year),
    label: item.highlight_mn || "Амжилт",
    detail: item.description_mn || "",
    tag: item.is_milestone ? "Онцлох" : "Түүх",
    image: item.image_url,
    isMilestone: item.is_milestone,
    achievements: (item.achievements || []).map(achievement => ({
      id: achievement.id,
      title: achievement.title_mn,
      description: achievement.description_mn || "",
      image: achievement.image_url,
      category: {
        id: achievement.category?.id || achievement.category_id,
        name: achievement.category?.name_mn || "Амжилт",
        icon: achievement.category?.icon || null,
      },
    })),
  }));
}

function categoryIcon(category: string) {
  if (category.includes("Төгсөгч")) return <GraduationCap size={18} />;
  if (category.includes("Хамт")) return <Users size={18} />;
  if (category.includes("Судал")) return <Microscope size={18} />;
  return <Award size={18} />;
}

function Footer() {
  const [tetris, setTetris] = useState(false);
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div><span>LOCATION</span><p>Партизаны гудамж, Сүхбаатар дүүрэг, Улаанбаатар</p></div>
        <div><span>CONTACT</span><p>+976 11 327226<br />School_11@edub.edu.mn</p></div>
        <div><span>SOCIAL</span><p className="socials"><a href="https://www.facebook.com/search/top?q=11-%D1%80%20%D1%81%D1%83%D1%80%D0%B3%D1%83%D1%83%D0%BB%D1%8C" target="_blank" rel="noreferrer"><Facebook /></a><a href="https://www.instagram.com/explore/search/keyword/?q=11-%D1%80%20%D1%81%D1%83%D1%80%D0%B3%D1%83%D1%83%D0%BB%D1%8C" target="_blank" rel="noreferrer"><Instagram /></a><a href="https://www.youtube.com/results?search_query=11-%D1%80+%D1%81%D1%83%D1%80%D0%B3%D1%83%D1%83%D0%BB%D1%8C" target="_blank" rel="noreferrer"><Youtube /></a></p></div>
      </div>
      <button className="tetris-trigger" onClick={() => setTetris(true)} aria-label="Нууц тоглоом" />
      <p className="copyright">© 2026 Нийслэлийн 11-р сургууль</p>
      {tetris && <div className="modal" onClick={() => setTetris(false)}><div className="tetris" onClick={e => e.stopPropagation()}><button onClick={() => setTetris(false)}><X /></button>{Array.from({ length: 120 }).map((_, i) => <span key={i} className={i % 7 === 0 || [55, 56, 57, 68, 81, 82, 94].includes(i) ? "filled" : ""} />)}</div></div>}
    </footer>
  );
}

function CursorFollower() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const cursor = document.querySelector<HTMLElement>(".cursor-dot");
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let frame = 0;

    const move = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    const over = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      cursor.classList.toggle("active", Boolean(target.closest("button, a, .news-card, .teacher-card, input")));
    };
    const tick = () => {
      x += (mouseX - x) * 0.18;
      y += (mouseY - y) * 0.18;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="cursor-dot" aria-hidden="true" />;
}

export function App() {
  if (window.location.pathname === "/admin/login") return <AdminLogin />;
  if (window.location.pathname.startsWith("/admin")) return <AdminApp />;

  const { page, navigate } = usePage();
  const [siteData, setSiteData] = useState({
    news: fallbackNews,
    teachers: fallbackTeachers,
    settings: defaultSchoolSettings,
    achievements: fallbackAchievements,
    courses: fallbackCourseSections,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-data")
      .then(response => response.ok ? response.json() : Promise.reject(new Error(`Site data failed: ${response.status}`)))
      .then((payload: {
        news: NewsArticle[];
        teachers: Teacher[];
        settings: SchoolSettings;
        achievements: AchievementYear[];
        courses: CourseSection[];
      }) => {
        if (cancelled) return;
        setSiteData({
          news: payload.news.length ? mapNewsArticles(payload.news) : fallbackNews,
          teachers: payload.teachers.length ? mapTeachers(payload.teachers) : fallbackTeachers,
          settings: payload.settings || defaultSchoolSettings,
          achievements: payload.achievements.length ? mapAchievements(payload.achievements) : fallbackAchievements,
          courses: payload.courses.length ? mapCourseSections(payload.courses) : fallbackCourseSections,
        });
      }).catch(error => {
        console.error("Supabase data bootstrap failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="grain-overlay" aria-hidden="true" />
      <CursorFollower />
      <Header page={page} navigate={navigate} />
      <div className="route-fade" key={page}>
        {page === "home" && <Home navigate={navigate} newsItems={siteData.news} teacherItems={siteData.teachers} settings={siteData.settings} />}
        {page === "about" && <About settings={siteData.settings} />}
        {page === "achievements" && <Achievements achievements={siteData.achievements} />}
        {page === "courses" && <Courses sections={siteData.courses} />}
        {page === "apply" && <Apply />}
      </div>
      <Footer />
    </>
  );
}

export default App;
