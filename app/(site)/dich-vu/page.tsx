import { getContent } from '../../../lib/colorcenter-server';
import { publicEntries } from '../../../lib/site-navigation';
import { PageHeading, QuoteBanner, ServiceGrid } from '../sections';

export const metadata = {title: 'Dịch vụ quảng cáo | Color Center', description: 'Các dịch vụ thiết kế, in ấn, gia công và thi công quảng cáo của Color Center.'};

export default async function ServicesPage() {
  const {data} = await getContent();
  return <>
    <PageHeading title="Dịch vụ quảng cáo" description="Thiết kế, gia công, in ấn và thi công cho cửa hàng, showroom và doanh nghiệp."/>
    <section className="section"><div className="wrap"><ServiceGrid items={publicEntries(data.services)}/></div></section>
    <QuoteBanner/>
  </>;
}
