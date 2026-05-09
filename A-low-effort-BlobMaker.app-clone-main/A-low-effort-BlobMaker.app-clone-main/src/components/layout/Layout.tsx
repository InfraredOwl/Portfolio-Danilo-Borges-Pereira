import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function Layout({ children, headerActions }: LayoutProps) {
  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* Background Layers */}
      <div className="atmosphere" />
      <div className="atmosphere-beams" />
      
      {/* Header / Nav */}
      <header className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto z-10">
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Blob Physics Simulator</h1>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex gap-4">
            <span className="text-xs font-mono opacity-50 uppercase tracking-widest px-3 py-1 border border-white/10 rounded-full">System v2.4.0</span>
          </div>
          {headerActions}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full max-w-6xl mx-auto z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/20 backdrop-blur-md border-t border-white/5 py-8 mt-12 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Newsletter</a>
            <a href="#" className="hover:text-blue-400 transition-colors">More Products</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>
          <div className="text-sm text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} BLOBMAKER // SYSTEM ACTIVE
          </div>
        </div>
      </footer>
    </div>
  );
}
