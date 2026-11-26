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
    <section className="hero home-hero"><div className="wrap hero-grid">
      <div className="hero-copy"><p className="kicker"><span/> THIẾT KẾ VÀ THI CÔNG QUẢNG CÁO</p>
        <h1>{data.title}</h1><p className="intro">{data.subtitle}</p>
        <div className="actions"><a className="button" href="/dich-vu">Khám phá dịch vụ</a><a className="button outline" href="/du-an">Xem dự án</a></div>
      </div>
      <CoverSlideshow images={[data.hero, data.heroTwo, data.heroThree].filter(Boolean)} name={data.name}/>
    </div></section>
    <Partners/>
    <section id="dich-vu" className="section paper"><div className="wrap">
      <div className="section-heading home-section-heading"><h2>Giải pháp quảng cáo</h2><a className="text-link" href="/dich-vu">Tất cả dịch vụ</a></div>
      <ServiceGrid items={services.slice(0,6)}/>
    </div></section>
    {projects.length > 0 && <section id="du-an" className="section work"><div className="wrap">
      <div className="section-heading home-section-heading"><h2>Dự án thi công</h2><a className="text-link" href="/du-an">Tất cả dự án</a></div>
      <ProjectCarousel projects={projects}/>
    </div></section>}
    <section id="gioi-thieu" className="section paper"><div className="wrap about-grid home-about">
      <div><h2>Về {data.name}</h2><p>{data.about}</p><a className="text-link about-link" href="/gioi-thieu">Giới thiệu công ty</a></div>
      <Process/>
    </div></section>
    <QuoteBanner/>
    <section className="section location-section" aria-labelledby="location-title">
      <div className="wrap">
        <h2 id="location-title">Địa chỉ Color Center</h2>
        <article className="location-office" aria-labelledby="office-title">
          <div>
            <h3 id="office-title">Văn phòng</h3>
            <p>{data.address}</p>
          </div>
          <a className="button outline" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.address)}`} target="_blank" rel="noreferrer">Chỉ đường đến văn phòng</a>
        </article>
        <article className="location-grid" aria-labelledby="workshop-title">
          <div className="location-copy">
            <h3 id="workshop-title">Nhà xưởng</h3>
            <p>C3 Lê Thị Riêng, phường Thới An, TP. Hồ Chí Minh</p>
            <a className="button" href="https://maps.app.goo.gl/L9Q2LeQcuuWD7eBt6" target="_blank" rel="noreferrer">Chỉ đường đến nhà xưởng</a>
          </div>
          <iframe
            className="location-map"
            title="Bản đồ nhà xưởng Color Center"
            src="https://maps.google.com/maps?q=10.8644586%2C106.656293&amp;z=17&amp;output=embed"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </article>
      </div>
    </section>
  </>;
}
