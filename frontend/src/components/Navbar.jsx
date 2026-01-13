import React from 'react';
import { Menu, User } from 'lucide-react';

const Navbar = ({ user, toggleMobileSidebar }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 fixed top-0 w-full md:w-[calc(100%-16rem)] md:ml-64 z-10 transition-all">
      <button onClick={toggleMobileSidebar} className="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-lg">
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4 ml-auto">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
