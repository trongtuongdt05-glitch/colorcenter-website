import { ZaloLink } from '../zalo-link';
import { getContent } from '../../../lib/colorcenter-server';
import { phoneUrl } from '../../../lib/site-navigation';
import { InquiryForm } from '../../visitor-controls';
import { PageHeading } from '../sections';

export const metadata = {title: 'Liên hệ và nhận báo giá | Color Center'};

export default async function ContactPage() {
  const {data} = await getContent();
  return <>
    <PageHeading title="Liên hệ" description="Cho chúng tôi biết bạn cần thi công hạng mục nào."/>
    <section id="bao-gia" className="section"><div className="wrap contact-grid">
      <div className="contact-card"><h2>{data.name}</h2>
        <dl><dt>Số điện thoại tư vấn</dt><dd><a href={phoneUrl(data.phone)}>{data.phone}</a></dd>
          <dt>Email</dt><dd><a href={`mailto:${data.email}`}>{data.email}</a></dd>
          <dt>Địa chỉ</dt><dd>{data.address}</dd></dl>
        <ZaloLink href={data.zalo}/>
      </div>
      <InquiryForm services={data.services.filter(item => item.visible).map(item => item.title)}/>
    </div></section>
  </>;
}
