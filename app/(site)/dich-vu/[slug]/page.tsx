import { notFound } from 'next/navigation';
import { getContent } from '../../../../lib/colorcenter-server';
import { publicEntries, quoteUrl } from '../../../../lib/site-navigation';
import { PageHeading, ServiceGrid } from '../../sections';

type Props = {params: Promise<{slug: string}>};

export async function generateMetadata({params}: Props) {
  const {slug} = await params;
  const {data} = await getContent();
  const item = publicEntries(data.services).find(entry => entry.slug === slug);
  return item ? {title: `${item.title} | ${data.name}`, description: item.description} : {};
}

export default async function ServiceDetail({params}: Props) {
  const {slug} = await params;
  const {data} = await getContent();
  const services = publicEntries(data.services);
  const item = services.find(entry => entry.slug === slug);
  if (!item) notFound();
  const related = services.filter(entry => entry.slug !== slug).slice(0,3);
  return <>
    <PageHeading title={item.title} parent={{title: 'Dịch vụ', href:'/dich-vu'}}/>
    <section className="section"><div className={`wrap detail-layout${item.image ? ' has-image' : ''}`}>
      <div><h2>Thông tin dịch vụ</h2><p className="preserve-lines">{item.description}</p>
        <a className="button" href={quoteUrl(item.title)}>Nhận báo giá dịch vụ này</a></div>
      {item.image && <img src={item.image} alt={item.title}/>}
    </div></section>
    {related.length > 0 && <section className="section work"><div className="wrap">
      <div className="section-heading"><h2>Dịch vụ khác</h2><a className="text-link" href="/dich-vu">Tất cả dịch vụ</a></div>
      <ServiceGrid items={related}/>
    </div></section>}
  </>;
}
