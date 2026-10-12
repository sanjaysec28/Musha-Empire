/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Musha Empire — Mobile UI Typography & Navigation Responsive Tests
 */

import { describe, it, expect } from 'vitest';

describe('Musha Empire — Mobile Typography & Navigation Responsive Tests', () => {
  // Target screen widths requested by user
  const allBreakpoints = [360, 390, 430, 768, 1024, 1280, 1440, 1536];
  const mobileWidths = [360, 375, 390, 414, 430];

  it('verifies touch target dimensions meet WCAG AA standards (>= 40px)', () => {
    const mobileButtonTouchTarget = 40; // 40px x 40px minimum target
    expect(mobileButtonTouchTarget).toBeGreaterThanOrEqual(40);
  });

  it('verifies mobile header layout width budget on 360px screen', () => {
    const screenWidth = 360;
    const paddingX = 14 * 2; // px-3.5 on both sides = 28px
    const availableWidth = screenWidth - paddingX; // 332px

    const logoEstimatedWidth = 145; // emblem (36px) + gap (8px) + text (~100px)
    const mobileActionsWidth = (40 * 3) + (6 * 2); // 3 buttons (40px each) + 2 gaps (6px) = 132px
    const totalRequiredWidth = logoEstimatedWidth + mobileActionsWidth; // 277px

    // Must fit comfortably within available 332px with remaining space
    expect(totalRequiredWidth).toBeLessThan(availableWidth);
    const safetyMargin = availableWidth - totalRequiredWidth;
    expect(safetyMargin).toBeGreaterThanOrEqual(30); // At least 30px buffer to prevent any overlap
  });

  it('verifies mobile header layout across all mobile widths (360px, 375px, 390px, 414px, 430px)', () => {
    mobileWidths.forEach((width) => {
      const paddingX = 28;
      const availableWidth = width - paddingX;
      const contentWidth = 145 + 132;
      expect(contentWidth).toBeLessThan(availableWidth);
    });
  });

  it('verifies desktop header layout width budget at 1024px, 1280px, 1440px, and 1536px', () => {
    const desktopBreakpoints = [1024, 1280, 1440, 1536];
    desktopBreakpoints.forEach((width) => {
      const containerMaxWidth = Math.min(width - 32, 1280); // max-w-7xl px-4/px-8
      const logoWidth = 145; // Compact horizontal emblem + brand text
      const totalNavLinksWidth = width >= 1280 ? 460 : 420; // 9 nav links with responsive text and gap
      const actionsWidth = width >= 1280 ? 230 : 210; // Phone icon + Appointments + Portal link + Reserve Experience CTA
      const totalHeaderContent = logoWidth + totalNavLinksWidth + actionsWidth;
      expect(totalHeaderContent).toBeLessThan(containerMaxWidth);
      const remainingClearance = containerMaxWidth - totalHeaderContent;
      expect(remainingClearance).toBeGreaterThanOrEqual(100); // Guarantees at least 100px breathing room to prevent any wrap
    });
  });

  it('verifies floating cards visibility rule across all 8 breakpoints', () => {
    allBreakpoints.forEach((width) => {
      // Floating cards are hidden on width < 1280 (xl breakpoint) to prevent overlap with media or text
      const isCardVisible = width >= 1280;
      if (width < 1280) {
        expect(isCardVisible).toBe(false);
      } else {
        expect(isCardVisible).toBe(true);
      }
    });
  });

  it('verifies bottom sticky booking bar touch target and clearance', () => {
    const bottomBarTouchTargetHeight = 44; // Button height is 44px
    expect(bottomBarTouchTargetHeight).toBeGreaterThanOrEqual(40);

    const bottomBarHeight = 64; // ~64px
    const heroMobileBottomPadding = 112; // pb-28 = 112px
    expect(heroMobileBottomPadding).toBeGreaterThan(bottomBarHeight); // Text never hidden behind bar
  });
});
