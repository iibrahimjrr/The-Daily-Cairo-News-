import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authService.resetPassword({ token, email, ...data });
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/auth/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as {
          message?: string;
          errors?: Record<string, string[]>;
        } | undefined;
        if (responseData?.errors?.email) {
          setError('password', { message: responseData.errors.email[0] });
        } else {
          toast.error(responseData?.message || 'Reset failed. The link may have expired.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center">
        <h1 className="font-serif text-2xl mb-4">Invalid Reset Link</h1>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          This password reset link is invalid or missing required parameters.
        </p>
        <Link to="/auth/forgot-password" className="btn-primary inline-block px-8 py-3">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-1">Create new password</h1>
      <p className="font-sans text-sm text-on-surface-variant mb-8">
        Choose a strong password for <span className="font-semibold text-on-surface">{email}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('password')}
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters with a number"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent font-sans text-sm outline-none transition-colors ${
                errors.password ? 'border-secondary' : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
          </div>
          {errors.password && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('password_confirmation')}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent font-sans text-sm outline-none transition-colors ${
                errors.password_confirmation ? 'border-secondary' : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
          </div>
          {errors.password_confirmation && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.password_confirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Resetting...</>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link to="/auth/login" className="flex items-center justify-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
}
