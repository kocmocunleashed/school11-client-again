import { MapPin } from "lucide-react";

const reunionMeetings = [
  { date: "--11-20", label: "XI/20", time: "17:00", weekday: "Баасан гараг", years: "1994–2002" },
  { date: "--11-21", label: "XI/21", time: "10:00", weekday: "Бямба гараг", years: "1947–1980" },
  { date: "--11-21", label: "XI/21", time: "14:00", weekday: "Бямба гараг", years: "2020–2023" },
  { date: "--11-27", label: "XI/27", time: "17:00", weekday: "Баасан гараг", years: "2003–2011" },
  { date: "--11-28", label: "XI/28", time: "10:00", weekday: "Бямба гараг", years: "1981–1993" },
  { date: "--11-28", label: "XI/28", time: "14:00", weekday: "Бямба гараг", years: "2024–2026" },
  { date: "--12-04", label: "XII/04", time: "12:00", weekday: "Баасан гараг", years: "2012–2019" },
];

const preparation = [
  {
    title: "Өөрийн болон анги хамт олны танилцуулга",
    description: "Төгссөн он, анги даасан багш, эзэмшсэн мэргэжил, одоогийн эрхэлж буй ажил, гавьяа шагнал, холбогдох мэдээлэл.",
  },
  {
    title: "Сургуулийн амьдралтай холбоотой дурсамж бичвэр",
    description: "Суралцаж байх үеийн сэтгэлд үлдсэн дурсгалтай үйл явдал, сургууль, багш нарын тухай дурсамж, яриа.",
  },
  {
    title: "Түүхэн фото зургууд",
    description: "Сургуулийн орчин, анги хамт олон, багш нар, уралдаан тэмцээн, нэг анги–нэг ажил зэрэг хуучны дурсгалт зургууд.",
  },
  {
    title: "Түүхийн ном болон статистикт хэрэгцээтэй баримтууд",
    description: "Тухайн үеийн төгсөгчдийн жагсаалт, олимпиад, урлаг, спортын амжилтын буухиа, сонин хэвлэлийн хайчилбар, холбогдох баримт материалууд.",
  },
];

export function AlumniReunion() {
  return (
    <section className="alumni-reunion" id="khutulbur" aria-labelledby="alumni-reunion-title">
      <div className="shell mx-auto w-[var(--shell)] max-w-[760px]">
        <header className="anniversary-heading">
          <p className="anniversary-kicker">Урилга</p>
          <h2 id="alumni-reunion-title">Төгсөгчдийн уулзалтын хуваарь</h2>
          <p>Ирэх 80 жилийн түүхэн ойгоо угтан «11-р сургуулийн түүхийн ном» бүтээх болон түүхэн архивыг бүрдүүлэх зорилготой уулзалтад үе үеийн төгсөгч та бүхнийг урьж байна.</p>
        </header>
        <div className="reunion-panel">
          <ol className="reunion-schedule" aria-label="Уулзалтын хуваарь" role="list">
            {reunionMeetings.map(({ date, label, time, weekday, years }) => (
              <li key={years}>
                <div className="reunion-date">
                  <time dateTime={date}>{label}</time>
                  <time dateTime={time}>{time}</time>
                </div>
                <div>
                  <h3>{years} оны төгсөгчид</h3>
                  <p>{weekday}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="reunion-venue"><MapPin size={20} aria-hidden="true" /><span><strong>Хаана:</strong> 11 дүгээр сургуулийн хичээлийн байранд</span></p>
          <div className="reunion-details">
            <h3>Уулзалтад ирэхдээ бэлтгэж ирэх зүйлс</h3>
            <ol className="reunion-preparation">
              {preparation.map(({ title, description }) => (
                <li key={title}>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="reunion-details">
            <h3>Холбоо барих</h3>
            <div className="reunion-contacts">
              <a href="tel:+97699941199">9994 1199</a>
              <a href="mailto:info@school11.edu.mn">info@school11.edu.mn</a>
            </div>
            <p>Хэрэв биечлэн ирэх боломжгүй бол дээрх мэдээлэл, фото зургуудыг сургуулийн цахим хаягаар илгээх боломжтой.</p>
            <p className="reunion-signature">80 жилийн ойн уулзалт зохион байгуулах комисс</p>
          </div>
        </div>
      </div>
    </section>
  );
}
