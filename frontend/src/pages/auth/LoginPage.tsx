import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const schema = z.object({
  email:    z.string().min(1, 'Please enter your email address').email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseData = err.response?.data as {
          message?: string;
          errors?: Record<string, string[]>;
        } | undefined;

        if (status === 422 && responseData?.errors) {
          // Field-level validation errors from Laravel
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            if (field === 'email' || field === 'password') {
              setError(field as keyof FormData, { message: messages[0] });
            }
          });
        } else if (status === 403) {
          setServerError(responseData?.message || 'Your account has been suspended.');
        } else {
          setServerError(responseData?.message || 'Login failed. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-1">Welcome back</h1>
      <p className="font-sans text-sm text-on-surface-variant mb-8">
        Sign in to your Daily Cairo account
      </p>

      {/* Server-level error */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6"
        >
          <AlertCircle size={16} className="text-secondary mt-0.5 shrink-0" />
          <p className="font-sans text-sm text-secondary">{serverError}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors ${
                errors.email
                  ? 'border-secondary focus:border-secondary'
                  : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="font-sans text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-3 border rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors ${
                errors.password
                  ? 'border-secondary focus:border-secondary'
                  : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-3 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="font-sans text-sm text-center text-on-surface-variant mt-6">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-on-surface font-semibold hover:underline">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
