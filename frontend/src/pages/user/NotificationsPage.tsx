import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/api';
import { Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../types';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications().then(r => r.data),
  });

  const markAllRead = useMutation({
    mutationFn: () => userService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notification[] = data?.data || [];

  return (
    <>
      <Helmet><title>Notifications — The Daily Cairo</title></Helmet>
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell size={22} className="text-secondary" />
            <h1 className="font-serif text-headline-lg">Notifications</h1>
          </div>
          {notifications.some(n => !n.read_at) && (
            <button onClick={() => markAllRead.mutate()} className="flex items-center gap-2 font-sans text-sm text-on-surface-variant hover:text-on-surface">
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>
        {isLoading ? (
          <p className="font-sans text-on-surface-variant">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={40} className="mx-auto text-on-surface-variant mb-4" />
            <p className="font-serif text-headline-md text-on-surface-variant">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={`island-card p-4 flex items-start gap-4 ${!n.read_at ? 'border-l-2 border-secondary' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read_at ? 'bg-secondary' : 'bg-outline-variant'}`} />
                <div className="flex-1">
                  <p className="font-sans text-sm text-on-surface">{(n.data as { message?: string })?.message || 'New notification'}</p>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
