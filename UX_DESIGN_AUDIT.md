# UCLA Subleasing App - UX & Design Audit

**Date**: February 14, 2026
**Reviewer**: Comprehensive code review
**App**: BruinLease - UCLA Student Subleasing Platform

---

## Executive Summary

This audit identifies **23 design and user experience issues** across the UCLA subleasing app, ranging from critical UX problems to minor polish improvements. Issues are categorized by severity: **Critical**, **High**, **Medium**, and **Low**.

---

## Critical Issues (Must Fix)

### 1. **Listing Details Page - Bottom Overlap**
- **Location**: `/app/listing/[id]/page.tsx` (Line 187-195)
- **Problem**: The fixed "Message" button (bottom-20) overlaps with the BottomNav (bottom-0), creating a **40px collision zone** where neither button is fully clickable
- **Impact**: Users cannot reliably tap the message button or bottom navigation
- **Fix**: Change message button to `bottom-24` or `bottom-28` to create proper spacing

### 2. **Create Listing - Bottom Button Overlap**
- **Location**: `/app/listing/new/page.tsx` (Line 639)
- **Problem**: Fixed submit button at `bottom-20` overlaps with BottomNav, same issue as above
- **Impact**: Cannot reliably submit listings on mobile
- **Fix**: Increase bottom padding to `bottom-24` or `bottom-28`

### 3. **Filter Modal - No Apply Button Feedback**
- **Location**: `/components/filters/FilterModal.tsx` (Line 336-343)
- **Problem**: Apply button shows result count `({resultCount})` but doesn't show active filter count
- **Impact**: Users don't know how many filters they've applied without looking at the count
- **Fix**: Add filter count badge, e.g., "Apply 5 Filters (128 results)"

---

## High Priority Issues

### 4. **Home Page - No Active Filter Indicator**
- **Location**: `/app/page.tsx`
- **Problem**: When filters are applied, there's no visual indicator on the home page showing filters are active
- **Impact**: Users forget they have filters on and think listings are missing
- **Fix**: Add a filter chip/badge row below the header showing active filters with clear buttons

### 5. **Listing Card - Inconsistent Room Type Icons**
- **Location**: `/components/listings/ListingCard.tsx` (Line 93)
- **Problem**: All room types (single, double, triple+) show the same `bed.double.fill` icon
- **Impact**: Reduces scannability - users can't quickly distinguish room types visually
- **Fix**: Use differentiated icons: `person` for single, `person.2` for double, `person.3` for triple+

### 6. **Search Bar - Limited Functionality**
- **Location**: `/components/layout/Header.tsx` (Line 50)
- **Problem**: Search placeholder says "Search streets (e.g. Kelton)..." but only searches streets
- **Impact**: Users expect to search by other criteria (price, dates, amenities) but can't
- **Fix**: Expand search to include title, description, or make placeholder more specific

### 7. **Create Listing - No Draft Saving**
- **Location**: `/app/listing/new/page.tsx`
- **Problem**: If user accidentally navigates away, all form data is lost
- **Impact**: Frustrating data loss for long forms
- **Fix**: Auto-save to localStorage on field changes with draft recovery on page load

### 8. **Verified Badge Inconsistency**
- **Location**: Multiple files
- **Problem**: Verified badge appears in different places: sometimes on cards, sometimes only on detail pages
- **Impact**: Inconsistent trust signals across the app
- **Fix**: Standardize - show badge consistently on both cards and detail pages

### 9. **No Empty State Illustrations**
- **Location**: `/app/page.tsx` (Line 107-112), `/app/bookmarks/page.tsx` (Line 47-53)
- **Problem**: Empty states use simple icon + text, no illustration
- **Impact**: Feels bare and unprofessional
- **Fix**: Add custom illustrations or use richer graphics for empty states

---

## Medium Priority Issues

### 10. **Date Formatting Inconsistency**
- **Location**: `formatDateRange` utility
- **Problem**: Dates might display in different formats depending on year
- **Impact**: Reduces readability
- **Fix**: Ensure consistent format (e.g., "Mar 25 - Jun 12" for same year)

### 11. **Missing Loading States**
- **Location**: Multiple pages
- **Problem**: No skeleton loaders when data is loading
- **Impact**: App feels slower than it is
- **Fix**: Add skeleton loaders for listing cards and detail pages

### 12. **Form Validation - Poor Error UX**
- **Location**: `/app/listing/new/page.tsx` (Line 206-211)
- **Problem**: Scrolls to first error but doesn't focus the input field
- **Impact**: Users might miss the error message
- **Fix**: Focus the error field after scrolling to it

### 13. **Image Upload - URL Only**
- **Location**: `/app/listing/new/page.tsx` (Line 574-610)
- **Problem**: Users must paste image URLs; no file upload option
- **Impact**: High friction - most users don't have images hosted online
- **Fix**: Add file upload with preview (use a service like Uploadcare or Cloudinary)

### 14. **Price Display - No Currency Symbol Consistency**
- **Location**: Various
- **Problem**: Sometimes "$1,500", sometimes "1500", sometimes formatted differently
- **Impact**: Unprofessional appearance
- **Fix**: Standardize all price displays using `formatPrice` utility

### 15. **Quarter Selection - No Visual Calendar**
- **Location**: `/app/listing/new/page.tsx` (Line 414-423)
- **Problem**: Quarter chips don't show date ranges
- **Impact**: Users might not know exact dates for UCLA quarters
- **Fix**: Add tooltip or subtitle showing date ranges for each quarter

### 16. **Accessibility - Missing ARIA Labels**
- **Location**: Multiple components
- **Problem**: Many interactive elements lack proper ARIA labels
- **Impact**: Poor screen reader experience
- **Fix**: Add comprehensive ARIA labels to all interactive elements

### 17. **Touch Targets - Too Small**
- **Location**: Various chip components
- **Problem**: Some chips are 32px height (below 44px mobile standard)
- **Impact**: Difficult to tap on mobile devices
- **Fix**: Increase minimum touch target to 44x44px

### 18. **Color Contrast - Insufficient**
- **Location**: `text-slateGray` and `text-lightSlate`
- **Problem**: Might not meet WCAG AA standards for contrast
- **Impact**: Accessibility issues for low-vision users
- **Fix**: Test all text colors against backgrounds for WCAG AA compliance

---

## Low Priority Issues (Polish)

### 19. **Bottom Navigation - No Haptic Feedback**
- **Location**: `/components/layout/BottomNav.tsx`
- **Problem**: No visual or haptic feedback when tapping nav items
- **Impact**: Feels less responsive
- **Fix**: Add subtle scale animation or ripple effect on tap

### 20. **Listing Card - No Hover State**
- **Location**: `/components/listings/ListingCard.tsx`
- **Problem**: No hover effect on desktop
- **Impact**: Less engaging on desktop
- **Fix**: Add subtle shadow or scale on hover

### 21. **Typography - Hierarchy Could Be Stronger**
- **Location**: Various
- **Problem**: Font weights are mostly 400 and 500; limited hierarchy
- **Impact**: Page scanning is harder
- **Fix**: Add 600 weight for important headings

### 22. **No Transition Animations**
- **Location**: Page navigation
- **Problem**: Page transitions are instant with no animation
- **Impact**: Feels abrupt
- **Fix**: Add page transition animations using Framer Motion or CSS transitions

### 23. **Missing Confirmation Dialogs**
- **Location**: Profile logout, bookmark removal
- **Problem**: No confirmation when performing destructive actions
- **Impact**: Accidental data loss
- **Fix**: Add confirmation modals for logout, unbookmark, delete listing

---

## Positive Design Elements

**What's Working Well:**
- ✅ Clean, minimal design aesthetic
- ✅ Consistent color palette (UCLA Blue #2774AE)
- ✅ Good use of icons (SF Symbols style)
- ✅ Responsive mobile-first layout (390px max width)
- ✅ Clear information hierarchy on listing cards
- ✅ Verified badge implementation
- ✅ Filter persistence in localStorage
- ✅ Proper form validation with inline errors

---

## Recommended Priority Order

1. **Fix bottom navigation overlaps** (#1, #2) - Critical for usability
2. **Add active filter indicators** (#4) - High user confusion
3. **Fix room type icons** (#5) - Quick visual improvement
4. **Add draft saving** (#7) - Prevents data loss
5. **Improve empty states** (#9) - Better first impression
6. **Add loading states** (#11) - Perceived performance
7. **Polish remaining issues** - As time permits

---

## Design System Recommendations

### Typography Scale
```css
/* Suggested additions */
.text-display {
  font-size: 32px;
  line-height: 40px;
  font-weight: 600; /* Add this weight */
}

.text-h2 {
  font-weight: 600; /* Increase from 500 for better hierarchy */
}
```

### Spacing System
```css
/* Bottom nav safe area */
--bottom-nav-height: 64px;
--bottom-safe-area: 80px; /* Nav + padding */
--fixed-button-bottom: 88px; /* Above nav */
```

### Touch Targets
```css
/* Minimum touch target */
--min-touch-target: 44px;
```

---

## Next Steps

1. **User Testing**: Test with 5-10 UCLA students to validate findings
2. **Analytics**: Track bounce rates on create listing page (draft saving impact)
3. **A/B Test**: Test filter indicator designs to see which improves discovery
4. **Accessibility Audit**: Run automated tools (axe, Lighthouse) for WCAG compliance

---

**End of Audit**
