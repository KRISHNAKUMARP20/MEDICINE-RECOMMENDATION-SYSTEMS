import React from 'react';
import { ChevronDown } from 'lucide-react';

export const NavDropdown = ({ title, icon: Icon, items }: { title: string, icon: any, items: {label: string, onClick?: () => void}[] }) => {
  return (
    <div className="relative group">
      <button className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-medium cursor-pointer">
        <Icon className="w-4 h-4" />
        <span className="whitespace-nowrap">{title}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
      <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white shadow-xl border border-slate-200 rounded-xl min-w-[200px] z-50 py-2">
        {items.map((item, idx) => (
          <button key={idx} onClick={item.onClick} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 cursor-pointer">
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
