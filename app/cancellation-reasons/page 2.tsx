import { redirect } from 'next/navigation';

export default function CancellationReasonsRoute() {
  redirect('/settings?tab=cancellation');
}
