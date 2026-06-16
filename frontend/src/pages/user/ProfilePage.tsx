import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/api';
import { User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRef } from 'react';

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1),
  password: z.string().min(8).regex(/[0-9]/),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', email: user?.email || '', bio: user?.bio || '' } });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const res = await userService.updateProfile(data);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
  };

  const handlePasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await userService.updatePassword(data);
      toast.success('Password updated. Please log in again.');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        Object.entries(apiErrors).forEach(([field, msgs]) => {
          passwordForm.setError(field as 'current_password', { message: msgs[0] });
        });
      } else {
        toast.error('Failed to update password.');
      }
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await userService.updateAvatar(formData);
      if (user) setUser({ ...user, avatar: res.data.avatar });
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to update avatar.'); }
  };

  return (
    <>
      <Helmet><title>Profile Settings — The Daily Cairo</title></Helmet>
      <div className="max-w-2xl mx-auto px-5 md:px-12 py-10">
        <div className="flex items-center gap-3 mb-10">
          <User size={22} className="text-secondary" />
          <h1 className="font-serif text-headline-lg">Profile Settings</h1>
        </div>

        {/* Avatar */}
        <div className="island-card p-6 mb-6">
          <h2 className="font-serif text-headline-md mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-full object-cover" />
              <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center hover:opacity-90">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <p className="font-sans text-sm font-semibold">{user?.name}</p>
              <p className="font-sans text-xs text-on-surface-variant">{user?.email}</p>
              <p className="font-sans text-xs text-on-surface-variant mt-1">JPG, PNG, GIF up to 2MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        {/* Profile form */}
        <div className="island-card p-6 mb-6">
          <h2 className="font-serif text-headline-md mb-5">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
            <div>
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Full Name</label>
              <input {...profileForm.register('name')} className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
              {profileForm.formState.errors.name && <p className="font-sans text-xs text-secondary mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Email</label>
              <input {...profileForm.register('email')} type="email" className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
            </div>
            <div>
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Bio</label>
              <textarea {...profileForm.register('bio')} rows={3} className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline resize-none" />
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>

        {/* Password form */}
        <div className="island-card p-6">
          <h2 className="font-serif text-headline-md mb-5">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            {[
              { name: 'current_password' as const, label: 'Current Password' },
              { name: 'password' as const, label: 'New Password' },
              { name: 'password_confirmation' as const, label: 'Confirm New Password' },
            ].map(field => {
              const fieldError = passwordForm.formState.errors[field.name];
              return (
                <div key={field.name}>
                  <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">{field.label}</label>
                  <input {...passwordForm.register(field.name)} type="password" className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
                  {fieldError?.message && (
                    <p className="font-sans text-xs text-secondary mt-1">{fieldError.message}</p>
                  )}
                </div>
              );
            })}
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </>
  );
}
