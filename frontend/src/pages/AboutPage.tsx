import { Helmet } from 'react-helmet-async';

export function AboutPage() {
  return (
    <>
      <Helmet><title>About Us — The Daily Cairo</title></Helmet>
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-16">
        <h1 className="font-serif text-display-lg-mobile mb-6">About The Daily Cairo</h1>
        <div className="prose max-w-none">
          <p className="font-sans text-body-lg text-on-surface-variant mb-6">
            The Daily Cairo is Egypt's premier digital news platform, dedicated to delivering authoritative, independent journalism to readers across the Arab world and beyond.
          </p>
          <p className="font-sans text-body-lg text-on-surface-variant mb-6">
            Founded with a mission to uphold the highest standards of editorial excellence, we cover politics, business, technology, sports, culture, and international affairs with depth, accuracy, and integrity.
          </p>
          <h2 className="font-serif text-headline-md mt-10 mb-4">Our Mission</h2>
          <p className="font-sans text-body-lg text-on-surface-variant mb-6">
            We believe that an informed citizenry is the foundation of a healthy democracy. Our mission is to provide clear, fair, and comprehensive reporting that empowers our readers to understand and engage with the world around them.
          </p>
          <h2 className="font-serif text-headline-md mt-10 mb-4">Editorial Standards</h2>
          <p className="font-sans text-body-lg text-on-surface-variant mb-6">
            Every story we publish goes through a rigorous editorial process. We verify facts from multiple sources, seek comment from all parties, and clearly distinguish news from opinion. Corrections are published promptly and transparently.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { label: '15+ Years', desc: 'Of trusted journalism' },
              { label: '2M+ Readers', desc: 'Monthly active readers' },
              { label: '50+ Journalists', desc: 'Across Egypt and the world' },
            ].map(stat => (
              <div key={stat.label} className="island-card p-6 text-center">
                <div className="font-serif text-display-lg-mobile mb-1">{stat.label}</div>
                <p className="font-sans text-sm text-on-surface-variant">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;

export function ContactPage() {
  return (
    <>
      <Helmet><title>Contact Us — The Daily Cairo</title></Helmet>
      <div className="max-w-2xl mx-auto px-5 md:px-12 py-16">
        <h1 className="font-serif text-display-lg-mobile mb-3">Contact Us</h1>
        <p className="font-sans text-body-md text-on-surface-variant mb-10">
          We'd love to hear from you. Reach out with tips, corrections, or feedback.
        </p>
        <form className="space-y-5" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Name</label>
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
            </div>
            <div>
              <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Email</label>
              <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
            </div>
          </div>
          <div>
            <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Subject</label>
            <input type="text" placeholder="How can we help?" className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline" />
          </div>
          <div>
            <label className="block font-sans text-label-caps uppercase tracking-wider text-on-surface-variant mb-2">Message</label>
            <textarea rows={6} placeholder="Your message..." className="w-full px-4 py-3 border border-outline-variant/40 rounded-lg bg-transparent font-sans text-sm outline-none focus:border-outline resize-none" />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Send Message</button>
        </form>
      </div>
    </>
  );
}
