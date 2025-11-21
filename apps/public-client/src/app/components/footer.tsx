import { Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Leaf className="text-emerald-500 w-6 h-6" />
          <span className="font-bold text-xl text-white">OlivesGreen</span>
        </div>
        <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} OlivesGreen Services. All rights reserved.
        </p>
      </div>
    </footer>
  );
}