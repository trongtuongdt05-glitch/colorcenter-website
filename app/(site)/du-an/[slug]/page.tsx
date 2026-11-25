import { notFound } from 'next/navigation';
import { getContent } from '../../../../lib/colorcenter-server';
import { publicEntries } from '../../../../lib/site-navigation';
import { PageHeading, QuoteBanner } from '../../sections';

type Props = {params: Promise<{slug: string}>};

export async function generateMetadata({params}: Props) {
  const {slug} = await params;
  const {data} = await getContent();
  const item = publicEntries(data.projects).find(entry => entry.slug === slug);
  return item ? {title: `${item.title} | ${data.name}`, description: item.description} : {};
}

export default async function ProjectDetail({params}: Props) {
  const {slug} = await params;
  const {data} = await getContent();
  const item = publicEntries(data.projects).find(entry => entry.slug === slug);
  if (!item) notFound();
  const service = data.services.find(entry => entry.visible && entry.title === item.category);
  const gallery = [...new Set(item.images ?? [])].filter(image => image && image !== item.image);
  return <>
    <PageHeading title={item.title} parent={{title:'Dự án', href:'/du-an'}}/>
    <section className="section"><div className={`wrap detail-layout${item.image ? ' has-image' : ''}`}>
      <div><p className="kicker">{item.category}</p><h2>Thông tin công trình</h2><p className="preserve-lines">{item.description}</p></div>
      {item.image && <img className={item.category === 'Dự án mẫu' ? 'sample-project-image' : undefined} src={item.image} alt={item.title}/>}
    </div></section>
    {gallery.length > 0 && <section className="section work"><div className="wrap">
      <h2>Hình ảnh dự án</h2>
      <div className="project-photo-grid">{gallery.map((image,index) => <figure key={image}>
        <img src={image} alt={`${item.title} · ảnh ${index + 1}`} loading="lazy"/>
      </figure>)}</div>
    </div></section>}
    <QuoteBanner service={service?.title}/>
  </>;
}
