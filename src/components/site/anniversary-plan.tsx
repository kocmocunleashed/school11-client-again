import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const anniversaryItems: { title: string; description: string; href?: string }[] = [
  {
    title: "Түүхийн ном, бүтээл",
    description: "Мэдээлэл цуглуулах, статистик, хүндэт дэвтэр, зураг, дурсамж, ном бүтээлийн үзэсгэлэн. Захиргаа болон заах аргын нэгдлүүд түүхэн баримт бичгүүдээ эмхэтгэж, онцлох төгсөгчдийн амжилтын түүхийг нэгтгэж байна.",
  },
  {
    title: "Баримтат кино, подкаст",
    description: "Сургуулийн 80 жилийн түүхэн кино, «80 жил – 80 зочин» видео контент бэлтгэх.",
  },
  {
    title: "Онол практикийн хурал",
    description: "«Монголын боловсролд 11-р сургуулийн оруулсан хувь нэмэр» сэдэвт ШУ-ны ОПБХ. Зочид, илтгэл тавих эрдэмтэн мэргэд.",
  },
  {
    title: "Төгсөгчдийн уулзалт",
    description: "Төлөөлөл уулзалт 2026.05.01. Төгсөгчдийн уулзалт — төгсөгч бүр оролцоно.",
    href: "#khutulbur",
  },
  {
    title: "Ойн хурал",
    description: "Хүндэт зочид, илтгэл, төрийн дээд шагнал, ойн бэлэг дурсгал.",
  },
  {
    title: "Ойн концерт",
    description: "Найруулагч, хөтлөгч, дуучин бүжигчид урих, хүүхдүүдийн урлагийн хувцас, бэлэг дурсгал.",
  },
  {
    title: "Олон улсын «APCYS-2027»",
    description: "Ази Номхон далайн бүсийн орнуудын байгалийн шинжлэх ухааны судалгаа бүтээлийн уралдаан.",
  },
  {
    title: "УМО-63",
    description: "УМО ивээн тэтгэгч, хүндэт зочид, оролцогчдын сэтгэлзүйн орчинг бүрдүүлэх.",
  },
  {
    title: "Бүтээлийн үзэсгэлэн",
    description: "Үе үеийн багш, сурагчдын бүтээл, ном зохиол, амжилт ололт.",
  },
  {
    title: "Бүтээн байгуулалт, засвар тохижилт",
    description: "Биеийн тамирын заал шинээр барих, өргөтгөл, тохижилт, өрөө танхимын засвар.",
  },
  {
    title: "Спортын нөхөрсөг тэмцээн",
    description: "Ойн хүрээнд шатар, сагс (15–17 нас), теннис (16–36 нас) нөхөрсөг тэмцээн зохион байгуулах.",
  },
  {
    title: "Хүүхдийн хөгжил зуслан",
    description: "Тог цахилгаан, хашаа, төгсөгчдийн төгөл, хөл бөмбөгийн талбай, байшин барилга.",
  },
  {
    title: "Бэлэг дурсгал",
    description: "Ойн дурсгалын зүйлс хүндэт зочид, онцлох төгсөгч, оролцогч болон 11-ийн бүх хүмүүст.",
  },
  {
    title: "Төгсөгч, эцэг эх, олон нийтийн оролцоо",
    description: "Ойн хандивын ажлын хэсэг, зарцуулалт, тайлан.",
  },
];

const planGroups = [
  { title: "Түүх, судалгаа, уулзалт", start: 0, end: 4 },
  { title: "Ойн арга хэмжээ, уралдаан", start: 4, end: 9 },
  { title: "Бүтээн байгуулалт, хамтын оролцоо", start: 9, end: anniversaryItems.length },
];

const anniversaryEvents = ["Ойн хурал", "Ойн концерт", "Ойн хүлээн авалт", "Ойн бэлэг дурсгал", "Бүтээлийн үзэсгэлэн"];
const anniversaryCompetitions = [
  "Гар зургийн уралдаан", "Фото зургийн уралдаан", "Шүлгийн уралдаан", "Эссэ бичлэг", "Постер уралдаан",
  "Компьютер тоглоом", "Реклам (сурталчилгаа)", "Анимейшн", "Видео контент", "Илтгэлийн уралдаан",
];

export function AnniversaryPlan() {
  return (
    <section className="anniversary-plan" id="oin-ajil" aria-labelledby="anniversary-plan-title">
      <div className="shell mx-auto w-[var(--shell)] max-w-[1100px]">
        <header className="section-heading anniversary-plan-header">
          <div>
            <h2 id="anniversary-plan-title">80 жилийн ойн төлөвлөгөө</h2>
            <p className="anniversary-motto">Бахдам түүхийн эзэд — Бидний 80 жил</p>
          </div>
          <Image className="anniversary-logo" src="/school-anniversary-logo.jpg" alt="11 дүгээр сургуулийн 80 жилийн ойн лого, 1947–2027" width={1056} height={824} sizes="(max-width: 700px) 120px, 210px" />
        </header>
        {planGroups.map(({ title, start, end }) => (
          <div className="anniversary-plan-group" key={title}>
            <h3>{title}</h3>
            <ol className="anniversary-grid" start={start + 1} role="list">
              {anniversaryItems.slice(start, end).map(({ title, description, href }, index) => (
                <li className="anniversary-card" key={title}>
                  <span aria-hidden="true">{String(start + index + 1).padStart(2, "0")}</span>
                  <h4>{title}</h4>
                  <p>{description}</p>
                  {href && <a className="anniversary-plan-link" href={href}>Уулзалтын хуваарь <ArrowDown size={16} aria-hidden="true" /></a>}
                </li>
              ))}
            </ol>
          </div>
        ))}
        <div className="anniversary-program">
          <section>
            <h3>Ойн арга хэмжээ</h3>
            <ul>{anniversaryEvents.map(event => <li key={event}>{event}</li>)}</ul>
          </section>
          <section>
            <h3>Ойн уралдаанууд</h3>
            <ul>{anniversaryCompetitions.map(competition => <li key={competition}>{competition}</li>)}</ul>
          </section>
        </div>
        <section className="anniversary-media" aria-labelledby="anniversary-media-title">
          <Image src="/school-anniversary-podcast.jpg" alt="" width={358} height={326} sizes="160px" />
          <div>
            <h3 id="anniversary-media-title">80 жил – 80 зочин</h3>
            <p>Ойн танилцуулгад подкастын 11 дугаарыг бичиж, 9 дугаарыг цацсан гэж мэдээлжээ.</p>
            <div className="anniversary-media-links">
              <a className="text-action" href="https://prezi.com/craft/podcast/gJtnsPZk2fXEN3e4gkEhcB?t=presentation">Ойн танилцуулгыг сонсох <ArrowUpRight size={16} aria-hidden="true" /></a>
              <a className="text-action" href="https://prezi.com/craft/video/gJtnsPZk2fXEN3e4gkEhcB?t=presentation">Ойн видеог үзэх <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
