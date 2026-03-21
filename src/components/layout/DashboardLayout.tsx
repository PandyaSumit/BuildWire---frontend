import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />

      <div className="pl-64">
        <EmailVerificationBanner />
        <Header />
        <Outlet />
      </div>
    </div>
  );
}
