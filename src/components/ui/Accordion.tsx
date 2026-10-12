/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccordionProps } from '../../types';

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  id,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      if (openIds.includes(itemId)) {
        setOpenIds(openIds.filter((id) => id !== itemId));
      } else {
        setOpenIds([...openIds, itemId]);
      }
    } else {
      if (openIds.includes(itemId)) {
        setOpenIds([]);
      } else {
        setOpenIds([itemId]);
      }
    }
  };

  return (
    <div id={id} className="w-full divide-y divide-brand-secondary/15 border-y border-brand-secondary/15">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id} id={`${id}-item-${item.id}`} className="py-2">
            <button
              id={`${id}-trigger-${item.id}`}
              onClick={() => toggleItem(item.id)}
              className="w-full py-4 flex items-center justify-between text-left font-sans font-semibold text-brand-primary uppercase tracking-wider text-sm hover:text-brand-secondary transition-colors focus:outline-none cursor-pointer"
              aria-expanded={isOpen}
            >
              <span id={`${id}-title-${item.id}`}>{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="ml-4 text-brand-text-muted hover:text-brand-secondary shrink-0"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-content-wrapper-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    id={`${id}-content-${item.id}`}
                    className="pb-5 pt-1 text-brand-text-muted font-sans text-sm leading-relaxed"
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
