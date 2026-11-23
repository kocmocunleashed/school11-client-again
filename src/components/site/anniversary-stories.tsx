import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const sampleMemories = [
  {
    role: "Төгсөгч",
    quote: "Энэ сургууль надад зөвхөн мэдлэг биш, амьдралын үнэт зүйлсийг өгсөн. Багш нарынхаа хайр халамжийг мартахгүй.",
  },
  {
    role: "Төгсөгч",
    quote: "Ангийнхантайгаа хамт өнгөрүүлсэн жилүүд миний амьдралын хамгийн дулаан дурсамж. 80 жилийн ойгоор баяр хүргэе!",
  },
  {
    role: "Багш",
    quote: "Багшийн хувьд олон жил ажиллахдаа хамгийн бахархдаг зүйл бол минь сурагчдын амжилт.",
  },
];

export function AnniversaryPortraits() {
  return (
    <section className="anniversary-portraits" id="khund" aria-labelledby="anniversary-portraits-title">
      <div className="anniversary-tribute shell mx-auto w-[var(--shell)] max-w-[1100px]">
        <header className="anniversary-heading">
          <p className="anniversary-kicker">Хүндэт самбар</p>
          <h2 id="anniversary-portraits-title">Түүхэнд үлдсэн нэрс</h2>
          <p>Сургуулийн нэр хүндийг өндөрт өргөсөн багш, үе үеийн төгсөгчид.</p>
          <Link className="anniversary-archive-link" href="/achievements#hall-of-fame">
            Сурагчдын амжилтыг үзэх <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </header>
        <figure className="anniversary-archive-photo">
          <Image src="/school-staff-archive.jpg" alt="11 дүгээр сургуулийн багш, ажилчдын хамтын зураг" width={1200} height={728} sizes="(max-width: 767px) 90vw, 550px" />
          <figcaption>Сургуулийн багш, ажилчдын хамт олон</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function AnniversaryMemories() {
  return (
    <section className="anniversary-memories" id="dursamj" aria-labelledby="anniversary-memories-title">
      <div className="shell mx-auto w-[var(--shell)] max-w-[1100px]">
        <header className="anniversary-heading">
          <h2 id="anniversary-memories-title">Төгсөгчдийн үг</h2>
          <p>Жишээ эшлэлүүд</p>
        </header>
        <ul className="anniversary-memory-grid" role="list">
          {sampleMemories.map(({ role, quote }) => (
            <li key={quote}>
              <figure className="anniversary-memory">
                <span className="anniversary-quote-mark" aria-hidden="true">“</span>
                <blockquote><p>{quote}</p></blockquote>
                <figcaption>{role}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
