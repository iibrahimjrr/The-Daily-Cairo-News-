import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary dark:bg-[#111] text-on-primary mt-16">
      <div className="max-w-[1440px] mx-auto px-5 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <h2 className="font-serif text-2xl font-bold mb-3">The Daily Cairo</h2>
            <p className="font-sans text-sm text-on-primary/60 max-w-xs leading-relaxed">
              Egypt's premier digital news platform delivering authoritative journalism, investigative reporting, and global perspectives.
            </p>
          </div>
          <div>
            <h3 className="font-sans text-label-caps uppercase tracking-wider text-on-primary/50 mb-4">Sections</h3>
            <ul className="space-y-2">
              {['Politics', 'Business', 'Technology', 'Sports', 'Health'].map(item => (
                <li key={item}>
                  <Link
                    to={`/category/${item.toLowerCase()}`}
                    className="font-sans text-sm text-on-primary/70 hover:text-on-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-sans text-label-caps uppercase tracking-wider text-on-primary/50 mb-4">Company</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'All Categories', to: '/categories' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="font-sans text-sm text-on-primary/70 hover:text-on-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-on-primary/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-on-primary/40">
            © 2025 The Daily Cairo. All rights reserved.
          </p>
          <a href="https://github.com/iibrahimjrr" target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-on-primary/40 hover:text-on-primary transition-colors ">
            <p>
              Made with by <span className="">Ibrahim Abd Elazeem</span>
            </p>
          </a>
          <p className="font-sans text-xs text-on-primary/40">
            Delivering truth, one story at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
