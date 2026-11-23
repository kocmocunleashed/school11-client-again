export default function Loading() {
  return (
    <main className="state-page" aria-busy="true">
      <div className="state-card">
        <div className="loading-mark" aria-hidden="true">11</div>
        <p role="status">Мэдээлэл ачаалж байна…</p>
      </div>
    </main>
  );
}
