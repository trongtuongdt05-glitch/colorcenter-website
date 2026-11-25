import { PageHeading } from './sections';

export default function MissingPage() {
  return <>
    <PageHeading title="Không tìm thấy trang"/>
    <section className="section"><div className="wrap">
      <p>Trang này có thể đã được đổi tên hoặc gỡ khỏi website.</p>
      <div className="actions"><a className="button" href="/dich-vu">Xem dịch vụ</a><a className="button outline" href="/du-an">Xem dự án</a></div>
    </div></section>
  </>;
}
