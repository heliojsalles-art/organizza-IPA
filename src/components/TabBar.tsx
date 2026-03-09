import { CheckSquare, List, Wallet, Settings } from "lucide-react";
import { motion } from "framer-motion";

type Tab = 'reminders' | 'lists' | 'finances' | 'settings';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
  { id: 'reminders', label: 'Lembretes', icon: CheckSquare },
  { id: 'lists', label: 'Listas', icon: List },
  { id: 'finances', label: 'Finanças', icon: Wallet },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

const TabBar = ({ active, onChange }: TabBarProps) => {
  return (
    <nav className="tab-bar fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 relative px-4 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabBar;
