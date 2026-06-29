import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/entrainement', label: 'Entraînement' },
  { to: '/regles', label: 'Règles' },
  { to: '/articles', label: 'Articles' },
  { to: '/certification', label: 'Certification' },
];

export function Nav() {
  return (
    <header className="bg-[#0B1F3A] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-8 h-14">
        <span
          className="text-lg font-semibold tracking-tight shrink-0"
          style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
        >
          Stratège
        </span>
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
          {TABS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm px-3 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
