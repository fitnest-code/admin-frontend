import { redirect } from 'next/navigation';

export default function LegalRoute() {
  redirect('/settings?tab=legal');
}

