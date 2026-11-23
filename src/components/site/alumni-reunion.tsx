import { Mail, MapPin, Phone } from "lucide-react";

const reunionMeetings = [
  { years: "1947–1980", date: "--11-21", day: "11 сарын 21", weekday: "Бямба", time: "10:00" },
  { years: "1981–1993", date: "--11-28", day: "11 сарын 28", weekday: "Бямба", time: "10:00" },
  { years: "1994–2002", date: "--11-20", day: "11 сарын 20", weekday: "Баасан", time: "17:00" },
  { years: "2003–2011", date: "--11-27", day: "11 сарын 27", weekday: "Баасан", time: "17:00" },
  { years: "2012–2019", date: "--12-04", day: "12 сарын 4", weekday: "Баасан", time: "12:00" },
  { years: "2020–2023", date: "--11-21", day: "11 сарын 21", weekday: "Бямба", time: "14:00" },
  { years: "2024–2026", date: "--11-28", day: "11 сарын 28", weekday: "Бямба", time: "14:00" },
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
      <div className="shell mx-auto w-[var(--shell)] max-w-[1100px]">
        <header className="anniversary-heading">
          <h2 id="alumni-reunion-title">Төгсөгчдийн уулзалтын хуваарь</h2>
          <p>Ирэх 80 жилийн түүхэн ойгоо угтан «11-р сургуулийн түүхийн ном» бүтээх болон түүхэн архивыг бүрдүүлэх зорилготой уулзалтад үе үеийн төгсөгч та бүхнийг урьж байна.</p>
        </header>
        <div className="reunion-layout">
          <div className="reunion-panel">
            <p className="reunion-venue">
              <MapPin size={20} aria-hidden="true" />
              <span>11 дүгээр сургуулийн хичээлийн байр</span>
            </p>
            <table className="reunion-schedule" aria-labelledby="alumni-reunion-title">
              <thead>
                <tr>
                  <th scope="col">Төгссөн он</th>
                  <th scope="col">Уулзах өдөр</th>
                  <th scope="col">Цаг</th>
                </tr>
              </thead>
              <tbody>
                {reunionMeetings.map(({ years, date, day, weekday, time }) => (
                  <tr key={years}>
                    <th scope="row">{years}</th>
                    <td><time dateTime={date}>{day}</time><span>{weekday} гараг</span></td>
                    <td><time dateTime={time}>{time}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="reunion-panel reunion-guide">
            <h3>Уулзалтад юу бэлдэх вэ?</h3>
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
            <div>
              <h3>Холбоо барих</h3>
              <p>Биечлэн ирэх боломжгүй бол мэдээлэл, фото зургаа цахим шуудангаар илгээгээрэй.</p>
            </div>
            <div className="reunion-contacts">
              <a href="tel:+97699941199"><Phone size={16} aria-hidden="true" />9994 1199</a>
              <a href="mailto:info@school11.edu.mn"><Mail size={16} aria-hidden="true" /><span>info@school11.edu.mn</span></a>
            </div>
          </div>
        </div>
        <p className="reunion-signature">80 жилийн ойн уулзалт зохион байгуулах комисс</p>
      </div>
    </section>
  );
}
