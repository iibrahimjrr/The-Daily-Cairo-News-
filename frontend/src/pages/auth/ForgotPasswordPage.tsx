import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/api';
import axios from 'axios';

const schema = z.object({
  email: z.string().min(1, 'Please enter your email address').email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { message?: string })?.message;
        setServerError(msg || 'Something went wrong. Please try again.');
      } else {
        setServerError('An unexpected error occurred.');
      }
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={28} className="text-on-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-3">Check your inbox</h1>
        <p className="font-sans text-sm text-on-surface-variant mb-2">
          We sent a password reset link to:
        </p>
        <p className="font-sans text-sm font-semibold text-on-surface mb-8">
          {getValues('email')}
        </p>
        <p className="font-sans text-xs text-on-surface-variant mb-8">
          Didn't receive it? Check your spam folder, or{' '}
          <button onClick={() => setSent(false)} className="underline hover:text-on-surface">
            try again
          </button>.
        </p>
        <Link to="/auth/login" className="btn-primary inline-block px-8 py-3">
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-1">Reset your password</h1>
      <p className="font-sans text-sm text-on-surface-variant mb-8">
        Enter your email and we'll send you a reset link.
      </p>

      {serverError && (
        <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6">
          <AlertCircle size={16} className="text-secondary mt-0.5 shrink-0" />
          <p className="font-sans text-sm text-secondary">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                errors.email ? 'border-secondary' : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-3 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Sending...</>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <p className="text-center mt-6">
        <Link to="/auth/login" className="flex items-center justify-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
}
