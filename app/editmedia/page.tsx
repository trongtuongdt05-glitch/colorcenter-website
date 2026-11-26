import { getContent } from '../../lib/colorcenter-server';
import { MediaEditor } from './media-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Media | Color Center' };

export default async function EditMediaPage() {
  const { data } = await getContent();
  return <main className="wrap media-page">
    <a className="text-link" href="/">Color Center</a>
    <h1>Edit Media</h1>
    <MediaEditor logo={data.mediaLogo} frame={data.mediaFrame} />
  </main>;
}
