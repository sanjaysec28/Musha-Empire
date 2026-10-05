/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../../contexts/AuthContext';
import AuthModule from './AuthModule';
import DashboardModule from './DashboardModule';

interface CustomerPortalProps {
  id: string;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
  onNavigateHome?: () => void;
}

export default function CustomerPortal({ id, triggerToast, onNavigateHome }: CustomerPortalProps) {
  const { user, loading, logout: authLogout } = useAuth();

  const sessionUser = {
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Royal Patron',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
  };

  const handleAuthSuccess = (userData: { name: string; email: string; phone: string }) => {
    // Left as callback compatibility, state is automatically tracked in context
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      triggerToast('info', 'Secure Logout Completed', 'You have closed your priority member session.');
      if (onNavigateHome) {
        onNavigateHome();
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      triggerToast('error', 'Logout Failed', err.message || 'Could not log out successfully.');
    }
  };

  if (loading) {
    return (
      <div id={id} className="min-h-screen bg-brand-bg flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-brand-accent border-t-brand-secondary rounded-full animate-spin" />
          <span className="font-sans text-xs uppercase tracking-widest text-brand-secondary">Verifying Account...</span>
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="min-h-screen bg-brand-bg relative z-10">
      {!user ? (
        <AuthModule
          id="portal-auth-screen"
          onAuthSuccess={handleAuthSuccess}
          triggerToast={triggerToast}
        />
      ) : (
        <DashboardModule
          id="portal-dashboard-screen"
          userProfile={sessionUser}
          onLogout={handleLogout}
          triggerToast={triggerToast}
        />
      )}
    </div>
  );
}

