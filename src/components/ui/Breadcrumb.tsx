/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreadcrumbProps } from '../../types';

export default function Breadcrumb({ items, id }: BreadcrumbProps) {
  return (
    <nav id={id} className="flex py-3 text-brand-text font-sans" aria-label="Breadcrumb">
      <ol id={`${id}-list`} className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} id={`${id}-item-${index}`} className="inline-flex items-center">
              {index > 0 && (
                <span id={`${id}-item-${index}-separator`} className="mx-2 text-brand-text-muted text-sm font-normal select-none">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  id={`${id}-item-${index}-label`}
                  className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-brand-gold-dark"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  id={`${id}-item-${index}-link`}
                  href={item.href}
                  className="text-[10px] md:text-xs uppercase tracking-widest font-medium text-brand-text-muted hover:text-brand-primary transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
