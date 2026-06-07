import { redirect } from 'next/navigation';

export default function ContactDetailsRoute() {
  redirect('/settings?tab=contact');
}

