import { permanentRedirect } from 'next/navigation';

export default function OldAdminPage() {
  permanentRedirect('/cpanel');
}
