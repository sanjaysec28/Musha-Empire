/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { TabsProps } from '../../types';

export default function Tabs({
  items,
  activeTabId,
  onChange,
  variant = 'underline',
  id,
}: TabsProps) {
  const [localActiveTabId, setLocalActiveTabId] = useState(
    activeTabId || (items[0]?.id || '')
  );

  const currentTabId = activeTabId !== undefined ? activeTabId : localActiveTabId;

  const handleTabClick = (tabId: string) => {
    if (activeTabId === undefined) {
      setLocalActiveTabId(tabId);
    }
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabContent = items.find((item) => item.id === currentTabId)?.content;

  // Design variants
  const navVariants = {
    underline: 'border-b border-brand-accent flex-wrap gap-x-8 gap-y-2',
    pills: 'p-1 bg-brand-surface-muted gap-x-1 border border-brand-accent rounded-none',
    minimal: 'border-b border-brand-accent flex-wrap gap-x-4 gap-y-2',
  };

  return (
    <div id={id} className="w-full flex flex-col">
      {/* Tab bar header */}
      <div
        id={`${id}-header-container`}
        className={`flex ${navVariants[variant]} mb-6`}
      >
        {items.map((tab) => {
          const isActive = tab.id === currentTabId;
          
          let tabClasses = 'relative px-4 py-3 font-sans text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer focus:outline-none';
          
          if (variant === 'underline') {
            tabClasses += isActive ? ' text-brand-primary font-semibold' : ' text-brand-text-muted hover:text-brand-primary';
          } else if (variant === 'pills') {
            tabClasses += ` px-5 py-2.5 rounded-none ${
              isActive ? 'text-[#121212] font-semibold bg-brand-secondary' : 'text-brand-text-muted hover:text-brand-primary'
            }`;
          } else if (variant === 'minimal') {
            tabClasses += ` border border-transparent ${
              isActive
                ? 'bg-brand-surface border-brand-accent border-b-brand-surface z-10 text-brand-primary font-semibold translate-y-[1px]'
                : 'text-brand-text-muted hover:text-brand-primary'
            }`;
          }

          return (
            <button
              key={tab.id}
              id={`${id}-tab-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={`${tabClasses} ${tab.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <span className="relative z-10">{tab.label}</span>
              {isActive && variant === 'underline' && (
                <motion.div
                  layoutId={`${id}-active-underline`}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-secondary"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <motion.div
        key={currentTabId}
        id={`${id}-panel-${currentTabId}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        role="tabpanel"
        className="w-full text-brand-text"
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
}
