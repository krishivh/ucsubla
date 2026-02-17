'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../common/Icon';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: 'house', path: '/' },
    { name: 'Saved', icon: 'bookmark', path: '/bookmarks' },
    { name: 'Chat', icon: 'message', path: '/messages' },
    { name: 'Profile', icon: 'person', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-[12px] border-t border-borderLight z-50">
      <div className="flex items-center justify-between px-6 py-3 pb-safe app-container">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-1"
            >
              <Icon
                name={item.icon}
                size={24}
                className={isActive ? 'text-uclaBlue' : 'text-lightSlate'}
                strokeWidth={2}
              />
              <span
                className={`text-[10px] leading-[15px] font-medium ${
                  isActive ? 'text-uclaBlue' : 'text-lightSlate'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
