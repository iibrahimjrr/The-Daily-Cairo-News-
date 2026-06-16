import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminService } from '../../services/api';
import { User } from '../../types';
import { Search, Shield, Ban, CheckCircle, Trash2, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => adminService.getUsers({ search, role: roleFilter, page, per_page: 15 }).then(r => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => adminService.assignRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated.'); },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => adminService.banUser(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User banned.'); },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => adminService.unbanUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User unbanned.'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted.'); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to delete user.');
    },
  });

  const users: User[] = data?.data || [];
  const meta = data?.meta;

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <>
      <Helmet><title>Users — Admin Dashboard</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-headline-lg">Users</h1>
          {meta && <p className="font-sans text-sm text-on-surface-variant">{meta.total} total users</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-outline-variant/40 rounded-lg bg-surface font-sans text-sm outline-none text-on-surface"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="island-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">User</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Role</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-right font-sans text-label-caps uppercase tracking-wider text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-4 py-3">
                        <div className="flex gap-3 items-center animate-pulse">
                          <div className="w-9 h-9 rounded-full bg-surface-container" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-surface-container rounded w-1/3" />
                            <div className="h-3 bg-surface-container rounded w-1/2" />
                          </div>
                        </div>
                      </td></tr>
                    ))
                  : users.map(user => (
                      <tr key={user.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            <div>
                              <p className="font-sans text-sm font-medium text-on-surface">
                                {user.name}
                                {user.id === currentUser?.id && (
                                  <span className="ml-2 font-sans text-xs text-on-surface-variant">(you)</span>
                                )}
                              </p>
                              <p className="font-sans text-xs text-on-surface-variant">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            {user.roles.map(role => (
                              <span key={role} className={`font-sans text-xs px-2 py-0.5 rounded-full ${roleColors[role] || roleColors.user}`}>
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="font-sans text-xs text-on-surface-variant">
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.is_banned ? (
                            <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Banned</span>
                          ) : user.email_verified_at ? (
                            <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                          ) : (
                            <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Unverified</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {user.id !== currentUser?.id && (
                              <>
                                {/* Role selector */}
                                <div className="relative group">
                                  <button className="flex items-center gap-1 p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
                                    <Shield size={14} /><ChevronDown size={10} />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block w-28">
                                    {['admin', 'editor', 'user'].map(role => (
                                      <button
                                        key={role}
                                        onClick={() => roleMutation.mutate({ id: user.id, role })}
                                        className="w-full text-left px-3 py-1.5 font-sans text-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface capitalize"
                                      >
                                        {role}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {user.is_banned ? (
                                  <button
                                    onClick={() => unbanMutation.mutate(user.id)}
                                    title="Unban"
                                    className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const reason = window.prompt('Ban reason (optional):') || undefined;
                                      banMutation.mutate({ id: user.id, reason });
                                    }}
                                    title="Ban user"
                                    className="p-1.5 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors"
                                  >
                                    <Ban size={14} />
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
                                      deleteMutation.mutate(user.id);
                                    }
                                  }}
                                  title="Delete"
                                  className="p-1.5 rounded text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="font-sans text-xs text-on-surface-variant">
                Page {page} of {meta.last_page} — {meta.total} users
              </span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(meta.last_page, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded font-sans text-xs transition-colors ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
