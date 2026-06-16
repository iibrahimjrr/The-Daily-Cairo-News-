import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BreakingNewsTicker from '../components/news/BreakingNewsTicker';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-[#0f0f0f] text-on-surface dark:text-[#e5e5e5]">
      <Navbar />
      <BreakingNewsTicker />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
