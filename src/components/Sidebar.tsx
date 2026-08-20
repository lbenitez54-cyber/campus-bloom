import React from 'react';
import { FileText, Calendar, CalendarCheck2, FileEdit, BookOpen, User } from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  showResearchTab?: boolean;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'resumen', label: 'Resumen', icon: FileText },
  { id: 'cronograma', label: 'Cronograma', icon: Calendar },
  { id: 'asistencia', label: 'Asistencia', icon: CalendarCheck2 },
  { id: 'examenes', label: 'Exámenes', icon: FileEdit },
  { id: 'investigacion', label: 'Investigación', icon: BookOpen },
  { id: 'perfil', label: 'Perfil', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile,
  showResearchTab = true,
}) => {
  const navItems = showResearchTab
    ? ALL_NAV_ITEMS
    : ALL_NAV_ITEMS.filter((item) => item.id !== 'investigacion');
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        id="campusbloom-sidebar"
        className={`fixed md:static top-0 left-0 h-full md:h-auto z-50 md:z-20 transition-all duration-300 ease-out flex flex-col justify-center ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="w-[100px] sm:w-[110px] md:w-[118px] py-6 px-2.5 rounded-[28px] glass-card flex flex-col items-center gap-3 my-auto mx-3 md:mx-0 shadow-lg shadow-[#864e5a]/10 border border-white/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                id={`nav-tab-${item.id}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl relative transition-colors duration-200 group ${
                  isActive
                    ? 'text-[var(--theme-nav-active-text)] font-bold'
                    : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] font-medium'
                }`}
              >
                {/* Animated active background pill using layoutId */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[var(--theme-nav-active-bg)] border border-[var(--theme-nav-active-border)] rounded-2xl shadow-sm z-0"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Subtle active pill indicator on the side */}
                {isActive && (
                  <motion.span
                    layoutId="activeTabSideAccent"
                    className="absolute -left-1 w-1.5 h-6 bg-[var(--theme-accent)] rounded-r-full z-10"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <div
                  className={`p-1.5 rounded-xl relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[var(--theme-nav-active-text)]' : 'text-[var(--theme-text-muted)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[13px] tracking-tight mt-1 leading-tight text-center relative z-10 font-bold">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

