import { getContent } from '../../../lib/colorcenter-server';
import { publicEntries } from '../../../lib/site-navigation';
import { Showcase } from '../../visitor-controls';
import { PageHeading, QuoteBanner } from '../sections';

export const metadata = {title: 'Dự án thi công | Color Center', description: 'Xem hình ảnh và thông tin dự án thi công của Color Center.'};

export default async function ProjectsPage() {
  const {data} = await getContent();
  const projects = publicEntries(data.projects);
  return <>
    <PageHeading title="Dự án thi công" description="Xem hình ảnh các công trình theo từng hạng mục."/>
    <section className="section"><div className="wrap">
      {projects.length ? <Showcase projects={projects}/> : <p>Danh mục dự án đang được cập nhật.</p>}
    </div></section>
    <QuoteBanner/>
  </>;
}
