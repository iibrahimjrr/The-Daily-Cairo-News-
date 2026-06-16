import { Helmet } from 'react-helmet-async';
export default function PrivacyPage() {
  return (
    <>
      <Helmet><title>Privacy Policy — The Daily Cairo</title></Helmet>
      <div className="max-w-3xl mx-auto px-5 md:px-12 py-16">
        <h1 className="font-serif text-display-lg-mobile mb-6">Privacy Policy</h1>
        <p className="font-sans text-body-md text-on-surface-variant mb-4">Last updated: January 2025</p>
        <div className="space-y-8">
          {[
            { title: 'Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us. This includes your name, email address, and any content you submit.' },
            { title: 'How We Use Your Information', content: 'We use the information we collect to provide, maintain, and improve our services, to personalize your experience, and to communicate with you about news updates and account information.' },
            { title: 'Data Security', content: 'We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet is 100% secure.' },
            { title: 'Cookies', content: 'We use cookies and similar tracking technologies to improve your browsing experience, analyze site traffic, and understand where our audience comes from.' },
            { title: 'Contact', content: 'If you have any questions about this Privacy Policy, please contact us at privacy@dailycairo.com.' },
          ].map(section => (
            <div key={section.title}>
              <h2 className="font-serif text-headline-md mb-3">{section.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
