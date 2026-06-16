import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const schema = z
  .object({
    name:                  z.string().min(2, 'Name must be at least 2 characters').max(255),
    email:                 z.string().min(1, 'Please enter your email').email('Please enter a valid email address'),
    password:              z.string()
                             .min(8, 'Password must be at least 8 characters')
                             .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
                             .regex(/[0-9]/,    'Password must contain at least one number'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch('password', '');
  const passwordStrength = (() => {
    if (!passwordValue) return 0;
    let score = 0;
    if (passwordValue.length >= 8)  score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^a-zA-Z0-9]/.test(passwordValue)) score++;
    return score;
  })();

  const strengthColors = ['', 'bg-secondary', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels  = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser(data);
      toast.success('Account created! Welcome to The Daily Cairo.');
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as {
          message?: string;
          errors?: Record<string, string[]>;
        } | undefined;

        if (err.response?.status === 422 && responseData?.errors) {
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            const fieldName = field as keyof FormData;
            if (['name', 'email', 'password', 'password_confirmation'].includes(fieldName)) {
              setError(fieldName, { message: messages[0] });
            } else {
              setServerError(messages[0]);
            }
          });
        } else {
          setServerError(responseData?.message || 'Registration failed. Please try again.');
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const InputField = ({
    id,
    label,
    type = 'text',
    placeholder,
    error,
    icon: Icon,
    children,
    ...props
  }: {
    id: keyof FormData;
    label: string;
    type?: string;
    placeholder?: string;
    error?: string;
    icon: React.ElementType;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div>
      <label htmlFor={id} className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        <input
          id={id}
          {...register(id)}
          type={type}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors ${
            error ? 'border-secondary focus:border-secondary' : 'border-outline-variant/40 focus:border-outline'
          }`}
          {...props}
        />
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-1">Create an account</h1>
      <p className="font-sans text-sm text-on-surface-variant mb-8">
        Join The Daily Cairo — it's free.
      </p>

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
        {/* Name */}
        <InputField id="name" label="Full Name" placeholder="Your Name" error={errors.name?.message} icon={User} autoComplete="name" />

        {/* Email */}
        <InputField id="email" label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} icon={Mail} autoComplete="email" />

        {/* Password */}
        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min 8 chars, include a number"
              className={`w-full pl-10 pr-11 py-3 border rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors ${
                errors.password ? 'border-secondary' : 'border-outline-variant/40 focus:border-outline'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Strength indicator */}
          {passwordValue && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-outline-variant/30'
                    }`}
                  />
                ))}
              </div>
              <p className="font-sans text-xs text-on-surface-variant">
                Strength: <span className="font-semibold">{strengthLabels[passwordStrength]}</span>
              </p>
            </div>
          )}
          {errors.password && (
            <p className="flex items-center gap-1.5 font-sans text-xs text-secondary mt-1.5">
              <AlertCircle size={12} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              {...register('password_confirmation')}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors ${
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
          disabled={isLoading}
          className="w-full bg-primary text-on-primary font-sans text-sm font-semibold rounded-full py-3 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <CheckCircle size={16} /> Create Account
            </>
          )}
        </button>
      </form>

      <p className="font-sans text-sm text-center text-on-surface-variant mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-on-surface font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
