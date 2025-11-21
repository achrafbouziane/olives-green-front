import { Link } from 'react-router-dom';
import { Button } from '@olives-green/shared-ui';
import { Leaf, Menu } from 'lucide-react';

export function Navbar() {
  const scrollToQuote = () => {
    // If we are on the home page, scroll. If not, go home then scroll.
    if (window.location.pathname === '/') {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#quote';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-800">OlivesGreen</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
              Services
            </Link>
            <a href="#portfolio" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">
              Portfolio
            </a>
            <Button variant="primary" onClick={scrollToQuote}>
              Get a Quote
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}