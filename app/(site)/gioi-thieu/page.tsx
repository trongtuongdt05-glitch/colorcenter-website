import { getContent } from '../../../lib/colorcenter-server';
import { PageHeading, Process, QuoteBanner } from '../sections';

export const metadata = {title: 'Giới thiệu | Color Center'};

export default async function AboutPage() {
  const {data} = await getContent();
  return <>
    <PageHeading title={`Giới thiệu ${data.name}`}/>
    <section className="section paper"><div className="wrap about-grid">
      <div><h2>Thiết kế và thi công quảng cáo</h2><p>{data.about}</p><a className="text-link about-link" href="/dich-vu">Xem dịch vụ</a></div>
      <Process/>
    </div></section>
    <QuoteBanner/>
  </>;
}
