import { redirect } from 'next/navigation';
import { getContent } from '../../lib/colorcenter-server';
import { publicEntries, quoteUrl } from '../../lib/site-navigation';
import { ProjectCarousel } from '../visitor-controls';
import { CoverSlideshow } from './cover-slideshow';
import { Partners } from './partners';
import { Process, QuoteBanner, ServiceGrid } from './sections';

export default async function Home({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const selection = (await searchParams)['dich-vu'];
  if (typeof selection === 'string' && selection) redirect(quoteUrl(selection));
  const {data} = await getContent();
  const services = publicEntries(data.services);
  const projects = publicEntries(data.projects);
  return <>
    <section className="hero"><div className="wrap hero-grid">
      <div className="hero-copy"><p className="kicker"><span/> THIẾT KẾ VÀ THI CÔNG QUẢNG CÁO</p>
        <h1>{data.title}</h1><p className="intro">{data.subtitle}</p>
        <div className="actions"><a className="button" href="/dich-vu">Khám phá dịch vụ</a><a className="button outline" href="/du-an">Xem dự án</a></div>
      </div>
      <CoverSlideshow images={[data.hero, data.heroTwo, data.heroThree].filter(Boolean)} name={data.name}/>
    </div></section>
    <Partners/>
    <section id="dich-vu" className="section paper"><div className="wrap">
      <div className="section-heading"><h2>Giải pháp quảng cáo</h2><a className="text-link" href="/dich-vu">Tất cả dịch vụ</a></div>
      <ServiceGrid items={services.slice(0,6)}/>
    </div></section>
    {projects.length > 0 && <section id="du-an" className="section work"><div className="wrap">
      <div className="section-heading"><h2>Dự án thi công</h2><a className="text-link" href="/du-an">Tất cả dự án</a></div>
      <ProjectCarousel projects={projects}/>
    </div></section>}
    <section id="gioi-thieu" className="section paper"><div className="wrap about-grid">
      <div><h2>Về {data.name}</h2><p>{data.about}</p><a className="text-link about-link" href="/gioi-thieu">Giới thiệu công ty</a></div>
      <Process/>
    </div></section>
    <QuoteBanner/>
    <section className="section location-section" aria-labelledby="location-title">
      <div className="wrap location-grid">
        <div className="location-copy">
          <p className="kicker">ĐỊA CHỈ COLOR CENTER</p>
          <h2 id="location-title">Bạn có ở gần Color Center?</h2>
          <p>{data.address}</p>
          <a className="button" href="https://maps.app.goo.gl/LLvxLvhugYUr3X3TA" target="_blank" rel="noreferrer">Xem đường đi trên Google Maps</a>
        </div>
        <iframe
          className="location-map"
          title={`Bản đồ vị trí ${data.name}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(data.address)}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  </>;
}
