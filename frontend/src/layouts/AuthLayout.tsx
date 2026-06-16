import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#0f0f0f] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-[#1c1b1b] flex-col justify-between p-12">
        <Link to="/" className="text-on-primary font-serif text-2xl font-bold tracking-tight">
          The Daily Cairo
        </Link>
        <div>
          <blockquote className="text-on-primary/80 font-serif text-3xl leading-relaxed mb-6">
            "The press is the best instrument for enlightening the mind of man, and improving him as a rational, moral, and social being."
          </blockquote>
          <cite className="text-on-primary/50 font-sans text-sm tracking-widest uppercase">
            — Thomas Jefferson
          </cite>
        </div>
        <div className="text-on-primary/40 font-sans text-xs">
          © 2025 The Daily Cairo. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="font-serif text-2xl font-bold text-primary dark:text-[#e5e5e5]">
              The Daily Cairo
            </Link>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
