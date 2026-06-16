import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Bookmark, History, Bell, User, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Bookmark, label: 'Saved Articles', desc: 'Your bookmarked stories', to: '/dashboard/bookmarks', color: '#0f3460' },
  { icon: History, label: 'Reading History', desc: 'Articles youve read', to: '/dashboard/history', color: '#533483' },
  { icon: Bell, label: 'Notifications', desc: 'Your alerts', to: '/dashboard/notifications', color: '#bb0011' },
  { icon: User, label: 'Profile Settings', desc: 'Update your account', to: '/dashboard/profile', color: '#05c46b' },
];

export default function UserDashboard() {
  const { user } = useAuthStore();

  return (
    <>
      <Helmet><title>My Dashboard — The Daily Cairo</title></Helmet>
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full object-cover border-2 border-outline-variant" />
            <div>
              <h1 className="font-serif text-headline-lg">{user?.name}</h1>
              <p className="font-sans text-sm text-on-surface-variant">{user?.email}</p>
              {!user?.email_verified_at && (
                <span className="font-sans text-xs text-secondary">Email not verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} className="island-card p-6 flex items-center justify-between group hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color + '20' }}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-on-surface">{item.label}</p>
                  <p className="font-sans text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
