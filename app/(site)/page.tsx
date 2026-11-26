import { isEnglish, serviceEnglish } from '../../lib/site-language';
import { defaults } from '../../lib/colorcenter';
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
  const en = await isEnglish();
  const t = (vi:string, english:string) => en ? english : vi;
  const descriptions = [
    'Storefront signs, lightboxes, corporate signage and dimensional lettering.',
    'LED and neon lighting for storefronts and interiors.',
    'Custom stainless steel lettering, acrylic letters, cards and menus.',
    'UV, latex and vinyl printing, plus menus, vouchers and catalogues.',
    'Logo design, promotional materials and brand identity systems.',
    'Interior and exterior design for shops, showrooms and cafés.',
  ];
  const services = publicEntries(data.services).map(item => {
    if (!en) return item;
    const index = defaults.services.findIndex(service => service.title === item.title && service.description === item.description);
    return {...item,title:serviceEnglish(item.title),description:descriptions[index] ?? item.description};
  });
  const projects = publicEntries(data.projects);
  return <>
    <section className="hero home-hero"><div className="wrap hero-grid">
      <div className="hero-copy"><p className="kicker"><span/> THIẾT KẾ VÀ THI CÔNG QUẢNG CÁO</p>
        <h1>{en && data.title === defaults.title ? 'Signage that makes your storefront stand out.' : data.title}</h1><p className="intro">{en && data.subtitle === defaults.subtitle ? 'Design, fabrication and installation of signage, LED lighting and printed materials for shops, showrooms and businesses.' : data.subtitle}</p>
        <div className="actions"><a className="button" href="/dich-vu">{t('Khám phá dịch vụ','Explore services')}</a><a className="button outline" href="/du-an">{t('Xem dự án','View projects')}</a></div>
      </div>
      <CoverSlideshow images={[data.hero, data.heroTwo, data.heroThree].filter(Boolean)} name={data.name}/>
    </div></section>
    <Partners english={en}/>
    <section id="dich-vu" className="section paper"><div className="wrap">
      <div className="section-heading home-section-heading"><h2>{t('Giải pháp quảng cáo','Advertising solutions')}</h2><a className="text-link" href="/dich-vu">{t('Tất cả dịch vụ','All services')}</a></div>
      <ServiceGrid english={en} items={services.slice(0,6)}/>
    </div></section>
    {projects.length > 0 && <section id="du-an" className="section work"><div className="wrap">
      <div className="section-heading home-section-heading"><h2>{t('Dự án thi công','Completed projects')}</h2><a className="text-link" href="/du-an">{t('Tất cả dự án','All projects')}</a></div>
      <ProjectCarousel english={en} projects={projects}/>
    </div></section>}
    <section id="gioi-thieu" className="section paper"><div className="wrap about-grid home-about">
      <div><h2>{t('Về','About')} {data.name}</h2><p>{en && data.about === defaults.about ? 'Color Center provides design, printing, fabrication and sign installation. Share a photo of your site or an initial idea so we can advise on materials, dimensions and options.' : data.about}</p><a className="text-link about-link" href="/gioi-thieu">{t('Giới thiệu công ty','About the company')}</a></div>
      <Process english={en}/>
    </div></section>
    <QuoteBanner english={en}/>
    <section className="section location-section" aria-labelledby="location-title">
      <div className="wrap">
        <h2 id="location-title">{t('Địa chỉ Color Center','Color Center locations')}</h2>
        <article className="location-office" aria-labelledby="office-title">
          <div>
            <h3 id="office-title">{t('Văn phòng','Office')}</h3>
            <p>{data.address}</p>
          </div>
          <a className="button outline" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(data.address)}`} target="_blank" rel="noreferrer">{t('Chỉ đường đến văn phòng','Get directions to the office')}</a>
        </article>
        <article className="location-grid" aria-labelledby="workshop-title">
          <div className="location-copy">
            <h3 id="workshop-title">{t('Nhà xưởng','Workshop')}</h3>
            <p>C3 Lê Thị Riêng, phường Thới An, TP. Hồ Chí Minh</p>
            <a className="button" href="https://maps.app.goo.gl/L9Q2LeQcuuWD7eBt6" target="_blank" rel="noreferrer">{t('Chỉ đường đến nhà xưởng','Get directions to the workshop')}</a>
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
