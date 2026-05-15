import { redirect } from 'next/navigation';

export default function AdminRedirect() {
  // Otomatis mengarahkan user dari /admin ke /dashboard/admin
  redirect('/dashboard/admin');
}