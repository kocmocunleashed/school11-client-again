import Link from "next/link";

export default function NotFound() {
  return <main className="state-page"><p className="overline">404</p><h1>Хуудас олдсонгүй</h1><p>Хаяг өөрчлөгдсөн эсвэл устсан байна.</p><Link className="primary-button" href="/">Нүүр хуудас руу очих</Link></main>;
}
