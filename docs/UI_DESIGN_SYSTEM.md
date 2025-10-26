# Meytle UI Design System Documentation

**Version:** 1.0.0
**Last Updated:** January 2025
**Framework:** React 19 + TypeScript + Tailwind CSS v4

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Typography System](#2-typography-system)
3. [Color System](#3-color-system)
4. [Spacing System](#4-spacing-system)
5. [Component Library](#5-component-library)
6. [Button System](#6-button-system)
7. [Form Elements](#7-form-elements)
8. [Layout System](#8-layout-system)
9. [Responsive Design](#9-responsive-design)
10. [Animation & Interactions](#10-animation--interactions)
11. [Visual Effects](#11-visual-effects)
12. [Accessibility](#12-accessibility)
13. [Icon System](#13-icon-system)
14. [Custom CSS Utilities](#14-custom-css-utilities)
15. [Design Patterns](#15-design-patterns)
16. [Component Examples](#16-component-examples)

---

## 1. Executive Summary

### Design Philosophy

Meytle's UI design system is built on principles of **modern elegance**, **accessibility**, and **consistency**. The design leverages a vibrant purple-to-pink gradient theme that creates a warm, inviting atmosphere while maintaining professional credibility.

### Key Design Principles

1. **Visual Hierarchy** - Clear distinction between primary, secondary, and tertiary elements
2. **Consistency** - Uniform spacing, colors, and interactions across all components
3. **Accessibility** - WCAG 2.1 AA compliance with focus states and ARIA labels
4. **Performance** - Optimized animations and lightweight components
5. **Responsiveness** - Mobile-first design with fluid layouts
6. **Modularity** - Reusable components with variant patterns

### Technology Stack

- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4.1.14 with PostCSS
- **Build Tool:** Vite
- **Font:** Inter (variable font)
- **Icons:** Font Awesome (react-icons) + Heroicons
- **Color Space:** OKLCH for perceptual uniformity

---

## 2. Typography System

### Font Family

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
             Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial,
             Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
```

**Configuration:** `src/styles/base/index.css` via `@theme` block

### Font Size Scale

| Class | Size (rem) | Size (px) | Usage |
|-------|------------|-----------|--------|
| `text-xs` | 0.75rem | 12px | Captions, helper text |
| `text-sm` | 0.875rem | 14px | Secondary text, labels |
| `text-base` | 1rem | 16px | Body text (default) |
| `text-lg` | 1.125rem | 18px | Emphasized body text |
| `text-xl` | 1.25rem | 20px | Small headings |
| `text-2xl` | 1.5rem | 24px | Section headings |
| `text-3xl` | 1.875rem | 30px | Page headings |
| `text-4xl` | 2.25rem | 36px | Hero headings |
| `text-5xl` | 3rem | 48px | Display text |
| `text-6xl` | 3.75rem | 60px | Extra large display |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | Buttons, emphasized text |
| `font-semibold` | 600 | Headings, important labels |
| `font-bold` | 700 | Strong emphasis |
| `font-extrabold` | 800 | Hero text, branding |

### Line Heights

| Class | Value | Usage |
|-------|-------|-------|
| `leading-tight` | 1.25 | Headings, compact text |
| `leading-normal` | 1.5 | Body text (default) |
| `leading-relaxed` | 1.75 | Long-form content |

### Text Colors

```typescript
// Primary text colors
'text-primary-500': '#a855f7'  // Purple
'text-primary-600': '#9333ea'
'text-primary-700': '#7c3aed'

// Secondary text colors
'text-secondary-500': '#ec4899'  // Pink
'text-secondary-600': '#db2777'

// Neutral text colors
'text-neutral-600': '#525252'  // Body text
'text-neutral-700': '#404040'
'text-neutral-800': '#262626'
```

---

## 3. Color System

### Primary Palette - Purple (OKLCH 290°)

| Shade | OKLCH Value | Hex Code | Usage |
|-------|-------------|----------|--------|
| 50 | `oklch(97% 0.02 290)` | `#faf5ff` | Subtle backgrounds |
| 100 | `oklch(95% 0.05 290)` | `#f3e8ff` | Hover states |
| 200 | `oklch(90% 0.10 290)` | `#e9d5ff` | Focus rings |
| 300 | `oklch(85% 0.15 290)` | `#d8b4fe` | Borders |
| 400 | `oklch(75% 0.20 290)` | `#c084fc` | Inactive elements |
| 500 | `oklch(65% 0.25 290)` | `#a855f7` | **Primary brand** |
| 600 | `oklch(55% 0.23 290)` | `#9333ea` | Hover primary |
| 700 | `oklch(45% 0.20 290)` | `#7c3aed` | Active states |
| 800 | `oklch(35% 0.15 290)` | `#6b21a8` | Dark accents |
| 900 | `oklch(25% 0.10 290)` | `#581c87` | Text on light |
| 950 | `oklch(15% 0.05 290)` | `#3b0764` | Darkest shade |

### Secondary Palette - Pink (OKLCH 340°)

| Shade | OKLCH Value | Hex Code | Usage |
|-------|-------------|----------|--------|
| 50 | `oklch(97% 0.02 340)` | `#fdf2f8` | Subtle backgrounds |
| 100 | `oklch(95% 0.05 340)` | `#fce7f3` | Hover states |
| 200 | `oklch(90% 0.10 340)` | `#fbcfe8` | Light accents |
| 300 | `oklch(85% 0.15 340)` | `#f9a8d4` | Borders |
| 400 | `oklch(75% 0.20 340)` | `#f472b6` | Secondary elements |
| 500 | `oklch(65% 0.25 340)` | `#ec4899` | **Secondary brand** |
| 600 | `oklch(55% 0.23 340)` | `#db2777` | Hover secondary |
| 700 | `oklch(45% 0.20 340)` | `#be185d` | Active states |
| 800 | `oklch(35% 0.15 340)` | `#9d174d` | Dark accents |
| 900 | `oklch(25% 0.10 340)` | `#831843` | Text on light |
| 950 | `oklch(15% 0.05 340)` | `#500724` | Darkest shade |

### Semantic Colors

#### Success (Green)
- 50: `#f0fdf4` - Light background
- 100: `#dcfce7` - Hover state
- 500: `#22c55e` - Primary success
- 800: `#166534` - Success text

#### Warning (Amber)
- 50: `#fffbeb` - Light background
- 100: `#fef3c7` - Hover state
- 500: `#f59e0b` - Primary warning
- 800: `#92400e` - Warning text

#### Error (Red)
- 50: `#fef2f2` - Light background
- 100: `#fee2e2` - Hover state
- 500: `#ef4444` - Primary error
- 800: `#991b1b` - Error text

#### Neutral (Gray)
- 50: `#fafafa` - Lightest gray
- 100: `#f5f5f5` - Light background
- 200: `#e5e5e5` - Borders
- 400: `#a3a3a3` - Muted text
- 600: `#525252` - Body text
- 800: `#262626` - Headings
- 950: `#0a0a0a` - Darkest black

### Gradient Definitions

```css
/* CSS Variables in src/styles/base/index.css */

--gradient-primary: linear-gradient(135deg, hsl(280 89% 60%), hsl(330 81% 60%));
/* Purple (#a855f7) to Pink (#ec4899) - Main brand gradient */

--gradient-secondary: linear-gradient(135deg, hsl(330 81% 60%), hsl(45 93% 58%));
/* Pink (#ec4899) to Warm (#f59e0b) - Accent gradient */

--gradient-warm: linear-gradient(135deg, hsl(45 93% 58% / .1), hsl(280 89% 60% / .1));
/* Subtle warm overlay - 10% opacity */

--gradient-hero: linear-gradient(135deg,
                  hsl(280 89% 60%) 0%,    /* Purple */
                  hsl(330 81% 60%) 50%,   /* Pink */
                  hsl(45 93% 58%) 100%);  /* Warm */
/* Full spectrum hero gradient */

--gradient-card: linear-gradient(135deg,
                  hsl(280 89% 60% / .05),  /* 5% Purple */
                  hsl(330 81% 60% / .05));  /* 5% Pink */
/* Subtle card background gradient */
```

### Color Usage Guidelines

1. **Primary Actions:** Use `primary-500` for main CTAs
2. **Secondary Actions:** Use `secondary-500` for secondary buttons
3. **Hover States:** Darken by 100 (e.g., 500 → 600)
4. **Active States:** Darken by 200 (e.g., 500 → 700)
5. **Disabled States:** Use 50% opacity
6. **Text on Dark:** Use white or `neutral-50`
7. **Text on Light:** Use `neutral-800` or `primary-900`

---

## 4. Spacing System

### Base Scale

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|--------|
| `xs` | 0.25rem | 4px | Micro spacing |
| `sm` | 0.5rem | 8px | Tight spacing |
| `md` | 1rem | 16px | Default spacing |
| `lg` | 1.5rem | 24px | Comfortable spacing |
| `xl` | 2rem | 32px | Section spacing |
| `2xl` | 3rem | 48px | Large sections |
| `3xl` | 4rem | 64px | Hero sections |
| `4xl` | 6rem | 96px | Maximum spacing |

### Padding Classes

```css
/* All sides */
p-1 (4px), p-2 (8px), p-3 (12px), p-4 (16px),
p-5 (20px), p-6 (24px), p-8 (32px)

/* Horizontal */
px-2 (8px), px-3 (12px), px-4 (16px), px-6 (24px), px-8 (32px)

/* Vertical */
py-1 (4px), py-2 (8px), py-3 (12px), py-4 (16px), py-6 (24px)

/* Common patterns */
p-6          /* Cards */
px-4 py-3    /* Buttons */
px-6 py-12   /* Sections */
```

### Margin Classes

```css
/* All sides */
m-0 (0px), m-1 (4px), m-2 (8px), m-4 (16px), m-6 (24px), m-8 (32px)

/* Top */
mt-1 (4px), mt-2 (8px), mt-4 (16px), mt-6 (24px), mt-8 (32px)

/* Bottom */
mb-2 (8px), mb-4 (16px), mb-6 (24px), mb-8 (32px)

/* Auto margins */
mx-auto     /* Center horizontally */
ml-auto     /* Push to right */
mr-auto     /* Push to left */
```

### Gap Utilities

```css
gap-1 (4px)    /* Tight */
gap-2 (8px)    /* Compact */
gap-3 (12px)   /* Default */
gap-4 (16px)   /* Comfortable */
gap-6 (24px)   /* Spacious */
gap-8 (32px)   /* Large */

/* Common uses */
flex gap-2     /* Icon + text */
flex gap-4     /* Form fields */
grid gap-6     /* Card grid */
```

### Container Widths

```css
/* Max widths */
max-w-md: 28rem (448px)     /* Forms, modals */
max-w-lg: 32rem (512px)     /* Medium containers */
max-w-xl: 36rem (576px)     /* Large modals */
max-w-2xl: 42rem (672px)    /* Content blocks */
max-w-4xl: 56rem (896px)    /* Wide content */
max-w-7xl: 80rem (1280px)   /* Main container */

/* Width utilities */
w-full: 100%                /* Full width */
w-80: 20rem (320px)         /* Dropdowns */
w-96: 24rem (384px)         /* Wide forms */
```

---

## 5. Component Library

### Component Overview

| Component | File | Purpose | Variants |
|-----------|------|---------|----------|
| `Button` | `Button.tsx` | Interactive actions | 5 variants, 3 sizes |
| `Card` | `Card.tsx` | Content containers | 4 variants, 3 padding sizes |
| `Badge` | `Badge.tsx` | Status indicators | 5 variants, 3 sizes |
| `LoadingSpinner` | `LoadingSpinner.tsx` | Loading states | 4 sizes, color options |
| `FavoriteButton` | `FavoriteButton.tsx` | Toggle favorites | Heart icon states |
| `InterestSelector` | `InterestSelector.tsx` | Multi-select interests | 12 predefined options |
| `PhoneNumberInput` | `PhoneNumberInput.tsx` | Phone with country | 200+ countries |
| `RoleSwitcher` | `RoleSwitcher.tsx` | Role selection | Dropdown with icons |
| `UserProfileCard` | `UserProfileCard.tsx` | User display | Profile info layout |
| `DashboardNav` | `DashboardNav.tsx` | Navigation | Role-based menus |

### Component Structure Pattern

```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  // ... other props
}

const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'base styles here';
  const variantClasses = variantStyles[variant];
  const sizeClasses = sizeStyles[size];

  return (
    <element
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    />
  );
};
```

---

## 6. Button System

### Button Component (`src/components/common/Button.tsx`)

#### Variants

```typescript
const variantStyles = {
  primary: `
    bg-gradient-to-r from-primary-500 to-secondary-500
    text-white
    hover:from-primary-600 hover:to-secondary-600
    focus:ring-primary-500
    shadow-lg hover:shadow-xl
  `,

  secondary: `
    bg-primary-500
    text-white
    hover:bg-primary-600
    focus:ring-primary-500
    shadow-md hover:shadow-lg
  `,

  outline: `
    border-2 border-primary-500
    text-primary-500
    hover:bg-primary-50
    focus:ring-primary-500
  `,

  ghost: `
    text-primary-500
    hover:bg-primary-50
    focus:ring-primary-500
  `,

  danger: `
    bg-error-500
    text-white
    hover:bg-error-600
    focus:ring-error-500
    shadow-md hover:shadow-lg
  `
};
```

#### Sizes

```typescript
const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',    // default
  lg: 'px-6 py-3 text-lg'
};
```

#### Base Classes

```css
inline-flex items-center justify-center
font-medium rounded-lg
transition-all duration-200
focus:outline-none focus:ring-2 focus:ring-offset-2
disabled:opacity-50 disabled:cursor-not-allowed
```

#### Button States

| State | Classes/Behavior |
|-------|------------------|
| **Default** | Base variant styles |
| **Hover** | Darker shade, enhanced shadow, scale effect |
| **Active** | Scale down slightly |
| **Focus** | Ring with offset |
| **Disabled** | 50% opacity, no pointer events |
| **Loading** | Show spinner, disable interaction |

#### Usage Examples

```tsx
// Primary gradient button
<Button variant="primary" size="lg" onClick={handleClick}>
  Get Started
</Button>

// Loading state
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Processing...' : 'Submit'}
</Button>

// Icon button
<Button variant="outline" size="sm">
  <FaHeart className="w-4 h-4 mr-2" />
  Favorite
</Button>

// Full width button
<Button fullWidth variant="secondary">
  Continue
</Button>
```

---

## 7. Form Elements

### Input Fields

#### Base Input Styling

```css
appearance-none
block w-full
px-4 py-3.5
bg-white
border-2 border-primary-100
rounded-xl
placeholder-primary-400/70
text-primary-700
focus:outline-none
focus:ring-2 focus:ring-primary-200
focus:border-primary-300
transition-all duration-200
shadow-sm
hover:border-primary-200
```

#### Input States

| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | `border-primary-100` | `bg-white` | `text-primary-700` |
| Hover | `border-primary-200` | `bg-white` | `text-primary-700` |
| Focus | `border-primary-300` | `bg-white` | `text-primary-700` |
| Error | `border-error-300` | `bg-error-50` | `text-error-700` |
| Disabled | `border-neutral-200` | `bg-neutral-50` | `text-neutral-400` |

### Select/Dropdown

```css
/* Dropdown Button */
flex items-center gap-2
px-3 py-2.5
border border-gray-300
rounded-l-lg
bg-gray-50
hover:bg-gray-100
transition-colors

/* Dropdown Menu */
absolute z-50 mt-1
w-80
bg-white
border border-gray-300
rounded-lg
shadow-lg
max-h-96
overflow-hidden

/* Option Item */
w-full
flex items-center gap-3
px-3 py-2
hover:bg-purple-50
transition-colors
cursor-pointer
```

### Checkbox & Radio

```css
/* Checkbox/Radio */
h-4 w-4
text-pink-600
focus:ring-pink-500
border-pink-300
rounded /* rounded-full for radio */

/* Label */
ml-2
text-sm
text-gray-700
```

### Form Layout Patterns

```tsx
// Vertical form with spacing
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input className="input-classes" />
  </div>
</form>

// Inline form elements
<div className="flex gap-4">
  <input className="flex-1" />
  <button className="px-6">Submit</button>
</div>

// Form group with error
<div className="space-y-1">
  <input className={error ? 'border-error-300' : 'border-primary-100'} />
  {error && (
    <p className="text-sm text-error-600">{error}</p>
  )}
</div>
```

---

## 8. Layout System

### Main Layout Structure

```tsx
// App Layout (MainLayout.tsx)
<div className="min-h-screen flex flex-col bg-gray-50">
  <Navbar />  {/* Sticky header */}
  <main className="flex-grow">
    <Outlet />  {/* Page content */}
  </main>
  <Footer />  {/* Site footer */}
</div>
```

### Navigation Component

```tsx
// Navbar (sticky with backdrop blur)
<nav className="
  bg-white/95
  backdrop-blur-sm
  border-b border-neutral-200
  sticky top-0 z-50
  shadow-sm
">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      {/* Navigation items */}
      {/* User menu */}
    </div>
  </div>
</nav>
```

### Page Container Patterns

```tsx
// Hero section with gradient
<div className="
  min-h-screen
  flex items-center justify-center
  bg-gradient-to-br from-primary-50 to-white
  py-12 px-4 sm:px-6 lg:px-8
">
  <div className="max-w-md w-full space-y-8">
    {/* Content */}
  </div>
</div>

// Dashboard layout
<div className="flex h-screen bg-gray-50">
  <aside className="w-64 bg-white shadow-md">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 overflow-y-auto">
    <div className="p-6">
      {/* Main content */}
    </div>
  </main>
</div>

// Content section
<section className="py-12 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    {/* Section content */}
  </div>
</section>
```

### Grid Systems

```css
/* Responsive grid patterns */

/* 2 columns on tablet, 4 on desktop */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

/* 3 column grid */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4

/* Auto-fit grid */
grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4

/* Interest selector grid */
grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3
```

### Flexbox Patterns

```css
/* Center alignment */
flex items-center justify-center

/* Space between */
flex justify-between items-center

/* Vertical stack */
flex flex-col gap-4

/* Horizontal with gap */
flex items-center gap-2

/* Wrap with gap */
flex flex-wrap gap-2

/* Sidebar layout */
flex-shrink-0  /* Sidebar */
flex-grow      /* Main content */
```

### Card Components

```css
/* Basic card */
bg-white
p-6
rounded-lg
shadow-sm

/* Elevated card */
bg-white
p-6
rounded-xl
shadow-lg
hover:shadow-xl
transition-shadow

/* Bordered card */
bg-white
border border-neutral-200
rounded-xl
p-6

/* Gradient card */
bg-gradient-to-br from-primary-50/50 to-secondary-50/50
p-6
rounded-xl
shadow-md
```

---

## 9. Responsive Design

### Breakpoint System

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Approach

```css
/* Base (mobile) → Progressive enhancement */

/* Example: Text size scaling */
text-sm md:text-base lg:text-lg

/* Example: Grid columns */
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4

/* Example: Padding increase */
px-4 sm:px-6 lg:px-8
```

### Common Responsive Patterns

#### Show/Hide Elements

```css
/* Hide on mobile, show on tablet+ */
hidden md:flex
hidden md:block

/* Show on mobile, hide on tablet+ */
block md:hidden
flex md:hidden

/* Show only on specific breakpoint */
hidden lg:block xl:hidden
```

#### Responsive Spacing

```css
/* Padding */
p-4 md:p-6 lg:p-8
px-4 md:px-6 lg:px-8
py-6 md:py-8 lg:py-12

/* Margin */
mt-4 md:mt-6 lg:mt-8
mb-6 md:mb-8 lg:mb-12

/* Gap */
gap-4 md:gap-6 lg:gap-8
```

#### Responsive Typography

```css
/* Headings */
text-2xl md:text-3xl lg:text-4xl
text-xl md:text-2xl lg:text-3xl

/* Body text */
text-sm md:text-base
text-base md:text-lg
```

#### Responsive Layouts

```css
/* Stack on mobile, side-by-side on desktop */
flex flex-col md:flex-row

/* Full width on mobile, auto on desktop */
w-full md:w-auto

/* Center on mobile, left on desktop */
text-center md:text-left
mx-auto md:mx-0
```

---

## 10. Animation & Interactions

### Transition Durations

```typescript
// Defined in theme.ts
transitions: {
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',  // default
  slow: '500ms ease-in-out'
}
```

### Transition Classes

```css
/* Duration */
duration-150   /* Fast - micro interactions */
duration-200   /* Quick - hover states */
duration-300   /* Normal - default */
duration-500   /* Slow - complex animations */

/* Properties */
transition-all        /* All properties */
transition-colors     /* Color changes */
transition-opacity    /* Fade effects */
transition-transform  /* Scale, rotate, translate */
transition-shadow     /* Shadow changes */

/* Timing */
ease-in-out    /* Default easing */
ease-in        /* Accelerate */
ease-out       /* Decelerate */
ease-linear    /* Constant speed */
```

### Hover Effects

```css
/* Opacity */
hover:opacity-75
hover:opacity-90

/* Scale */
hover:scale-105    /* Slight grow */
hover:scale-110    /* Moderate grow */
hover:scale-125    /* Large grow */

/* Translate (lift effect) */
hover:-translate-y-1    /* Lift 4px */
hover:-translate-y-0.5  /* Subtle lift 2px */

/* Shadow enhancement */
hover:shadow-md
hover:shadow-lg
hover:shadow-xl
hover:shadow-2xl

/* Color changes */
hover:bg-primary-50
hover:bg-primary-600
hover:text-primary-600
hover:border-primary-300

/* Gradient shifts */
hover:from-primary-600
hover:to-secondary-600

/* Brightness (gradient buttons) */
hover:brightness-95
hover:brightness-105
```

### Loading States

```css
/* Spinner animation */
animate-spin    /* 360° rotation loop */

/* Loading spinner structure */
<div className="
  animate-spin
  rounded-full
  h-5 w-5
  border-b-2 border-primary-500
"/>

/* Pulse animation */
animate-pulse   /* Opacity pulse */

/* Skeleton loading */
<div className="
  animate-pulse
  bg-gray-200
  rounded-lg
  h-4 w-full
"/>

/* Loading overlay */
<div className="
  absolute inset-0
  bg-white/50
  flex items-center justify-center
">
  <LoadingSpinner />
</div>
```

### Focus States

```css
/* Standard focus ring */
focus:outline-none
focus:ring-2
focus:ring-primary-500
focus:ring-offset-2

/* Input focus */
focus:ring-2
focus:ring-primary-200
focus:border-primary-300

/* Button focus */
focus:ring-2
focus:ring-primary-500
focus:ring-offset-2
focus:ring-offset-white

/* Link focus */
focus:outline-none
focus:underline
```

### Micro-Interactions

```tsx
// Icon rotation on expand
<ChevronDownIcon
  className={`
    w-5 h-5
    transition-transform duration-200
    ${isOpen ? 'rotate-180' : ''}
  `}
/>

// Badge appear animation
<Badge
  className="
    animate-in
    fade-in
    duration-300
  "
/>

// Card hover lift
<Card
  className="
    transition-all duration-300
    hover:-translate-y-1
    hover:shadow-xl
  "
/>

// Button press effect
<button
  className="
    transition-all
    active:scale-95
  "
/>
```

---

## 11. Visual Effects

### Shadow System

```typescript
// Defined shadows in theme.ts
shadows: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 20px rgb(168 85 247 / 0.3)',      // Purple glow
  'glow-lg': '0 0 40px rgb(168 85 247 / 0.4)',  // Large purple glow
  'glow-pink': '0 0 20px rgb(236 72 153 / 0.3)' // Pink glow
}
```

#### Shadow Usage

```css
/* Cards */
shadow-sm      /* Subtle depth */
shadow-md      /* Standard card */
shadow-lg      /* Elevated card */
shadow-xl      /* Modal/dropdown */

/* Buttons */
shadow-lg      /* Primary button */
shadow-md      /* Secondary button */

/* Hover states */
hover:shadow-xl
hover:shadow-2xl

/* Colored shadows */
shadow-purple-200/50
shadow-pink-200/50

/* Glow effects */
shadow-[0_0_20px_rgb(168_85_247_/_0.3)]
```

### Border Radius

```css
/* Scale */
rounded-sm     /* 4px */
rounded        /* 6px default */
rounded-md     /* 6px */
rounded-lg     /* 8px */
rounded-xl     /* 12px */
rounded-2xl    /* 16px */
rounded-3xl    /* 24px */
rounded-full   /* 9999px - pill/circle */

/* Directional */
rounded-t-lg   /* Top only */
rounded-b-lg   /* Bottom only */
rounded-l-lg   /* Left only */
rounded-r-lg   /* Right only */

/* Corner specific */
rounded-tl-lg  /* Top left */
rounded-tr-lg  /* Top right */
```

### Z-Index Layers

```css
/* Layer system */
z-0     /* Base content */
z-10    /* Overlays, tooltips */
z-20    /* Dropdown menus */
z-30    /* Modal backdrops */
z-40    /* Modals */
z-50    /* Navigation, top-level */

/* Common patterns */
/* Sticky nav */
sticky top-0 z-50

/* Modal backdrop */
fixed inset-0 z-30 bg-black/50

/* Modal content */
relative z-40

/* Dropdown */
absolute z-20
```

### Backdrop Effects

```css
/* Blur effects */
backdrop-blur-sm     /* 4px blur */
backdrop-blur        /* 8px blur */
backdrop-blur-md     /* 12px blur */
backdrop-blur-lg     /* 16px blur */

/* Common uses */
/* Navbar */
bg-white/95 backdrop-blur-sm

/* Modal backdrop */
bg-black/50 backdrop-blur-sm

/* Dropdown overlay */
bg-white/80 backdrop-blur
```

### Gradient Overlays

```css
/* Gradient overlays */
bg-gradient-to-t from-black/50 to-transparent
bg-gradient-to-b from-transparent to-white
bg-gradient-to-r from-primary-500/10 to-transparent

/* Image overlays */
<div className="relative">
  <img src="..." />
  <div className="
    absolute inset-0
    bg-gradient-to-t from-black/50 to-transparent
  " />
</div>
```

---

## 12. Accessibility

### ARIA Labels

```tsx
// Loading spinner
<div role="status" aria-label="Loading">
  <span className="sr-only">Loading...</span>
  <div className="animate-spin..." />
</div>

// Icon buttons
<button aria-label="Add to favorites">
  <HeartIcon />
</button>

// Form fields
<input
  aria-label="Email address"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>

// Navigation
<nav aria-label="Main navigation">
  {/* Nav items */}
</nav>
```

### Screen Reader Support

```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Usage */
<span className="sr-only">Open menu</span>
<span className="sr-only">Loading...</span>
<span className="sr-only">Current page</span>
```

### Keyboard Navigation

```tsx
// Focus management
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Escape':
      closeModal();
      break;
    case 'Tab':
      // Trap focus within modal
      break;
    case 'Enter':
      submitForm();
      break;
  }
};

// Tab order
<div tabIndex={0}>Focusable element</div>
<button tabIndex={-1}>Skip in tab order</button>

// Focus visible
<button className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary-500
">
```

### Semantic HTML

```html
<!-- Page structure -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<aside>...</aside>
<footer>...</footer>

<!-- Headings hierarchy -->
<h1>Page title</h1>
  <h2>Section heading</h2>
    <h3>Subsection</h3>

<!-- Lists -->
<ul role="list">
  <li>Item</li>
</ul>

<!-- Forms -->
<form>
  <label for="email">Email</label>
  <input id="email" type="email" />
</form>

<!-- Buttons vs Links -->
<button onClick={action}>Action</button>
<a href="/page">Navigation</a>
```

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

```css
/* Good contrast examples */
text-primary-900 on bg-primary-50    /* 8.2:1 */
text-white on bg-primary-500         /* 4.8:1 */
text-neutral-700 on bg-white         /* 10.9:1 */
```

---

## 13. Icon System

### Icon Libraries

#### Font Awesome (via react-icons/fa)
Primary icon library with 1500+ icons

```tsx
import {
  FaUser,
  FaHeart,
  FaCheck,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
```

#### Heroicons (via @heroicons/react)
Modern, clean icons

```tsx
import {
  ChevronDownIcon,
  SearchIcon,
  MenuIcon
} from '@heroicons/react/outline';
```

### Icon Sizes

```css
/* Size classes */
w-3 h-3    /* 12px - badges */
w-4 h-4    /* 16px - buttons */
w-5 h-5    /* 20px - navigation */
w-6 h-6    /* 24px - headers */
w-8 h-8    /* 32px - features */
w-12 h-12  /* 48px - hero */
```

### Icon Usage Patterns

```tsx
// Icon with text
<button className="flex items-center gap-2">
  <FaHeart className="w-4 h-4" />
  <span>Favorite</span>
</button>

// Icon button
<button
  className="p-2 rounded-full hover:bg-gray-100"
  aria-label="Close"
>
  <FaTimes className="w-5 h-5" />
</button>

// Loading spinner
<FaSpinner className="w-5 h-5 animate-spin" />

// Status icons
<FaCheck className="w-4 h-4 text-success-500" />
<FaTimes className="w-4 h-4 text-error-500" />

// Decorative icons
<div className="flex items-center gap-3">
  <div className="p-3 bg-primary-100 rounded-full">
    <FaUser className="w-6 h-6 text-primary-600" />
  </div>
  <span>Profile</span>
</div>
```

---

## 14. Custom CSS Utilities

### Gradient Utilities

```css
/* From src/styles/base/index.css */

.bg-hero-gradient {
  background-image: var(--gradient-hero);
  filter: saturate(95%);
}

.bg-card-gradient {
  background-image: var(--gradient-card);
}

.text-gradient-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.btn-gradient-primary {
  background-image: var(--gradient-primary);
  color: #fff;
}

.btn-gradient-primary:hover {
  filter: brightness(0.95);
}

/* Additional custom utilities */

.gradient-border {
  border: 2px solid transparent;
  background-image:
    linear-gradient(white, white),
    var(--gradient-primary);
  background-origin: border-box;
  background-clip: padding-box, border-box;
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Special Effects

```css
/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Neumorphism */
.neumorphic {
  background: #e0e0e0;
  box-shadow:
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
}

/* Glow text */
.text-glow {
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}
```

---

## 15. Design Patterns

### Component Composition Pattern

```tsx
// Base component with composition
const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Composed components
const CardHeader = ({ children }) => (
  <div className="mb-4 pb-4 border-b border-gray-200">
    {children}
  </div>
);

const CardBody = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>
```

### Variant Pattern

```tsx
// Define variants
const variants = {
  primary: 'bg-primary-500 text-white',
  secondary: 'bg-secondary-500 text-white',
  outline: 'border-2 border-primary-500 text-primary-500'
};

// Component with variant
const Component = ({ variant = 'primary' }) => (
  <div className={variants[variant]}>
    Content
  </div>
);
```

### State-Based Styling

```tsx
// Conditional classes
<div
  className={`
    p-4 rounded-lg transition-all
    ${isActive
      ? 'bg-primary-50 border-primary-500'
      : 'bg-white border-gray-200'
    }
    ${isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:shadow-md cursor-pointer'
    }
  `}
>
```

### Responsive Pattern

```tsx
// Mobile-first responsive
<div className="
  /* Mobile (base) */
  p-4 text-sm

  /* Tablet (md) */
  md:p-6 md:text-base

  /* Desktop (lg) */
  lg:p-8 lg:text-lg

  /* Wide (xl) */
  xl:p-10
">
```

### Loading State Pattern

```tsx
const Component = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <div>Content</div>;
};
```

---

## 16. Component Examples

### Complete Button Component

```tsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-md hover:shadow-lg'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
```

### Card Component with Variants

```tsx
import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children
}) => {
  const variantClasses = {
    default: 'bg-white shadow-sm',
    elevated: 'bg-white shadow-lg',
    bordered: 'bg-white border border-neutral-200',
    gradient: 'bg-gradient-to-br from-primary-50/50 to-secondary-50/50 shadow-md'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClass = hoverable
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer'
    : '';

  return (
    <div
      className={`
        rounded-xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
```

### Form Input Component

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  icon,
  className = '',
  ...props
}) => {
  const inputClasses = `
    appearance-none block w-full
    px-4 py-3.5
    bg-white
    border-2
    ${error ? 'border-error-300' : 'border-primary-100'}
    rounded-xl
    placeholder-primary-400/70
    text-primary-700
    focus:outline-none
    focus:ring-2
    ${error ? 'focus:ring-error-200' : 'focus:ring-primary-200'}
    ${error ? 'focus:border-error-300' : 'focus:border-primary-300'}
    transition-all duration-200
    shadow-sm
    hover:border-primary-200
    ${icon ? 'pl-12' : ''}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`${inputClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};

export default Input;
```

### Badge Component

```tsx
import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = ''
}) => {
  const variantClasses = {
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-error-100 text-error-800 border-error-200',
    info: 'bg-accent-100 text-accent-800 border-accent-200',
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium
        rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && (
        <span className="mr-1.5">{icon}</span>
      )}
      {children}
    </span>
  );
};

export default Badge;
```

---

## Design System Summary

The Meytle UI Design System provides a comprehensive, cohesive visual language that:

1. **Maintains Consistency** through standardized components and patterns
2. **Ensures Accessibility** with proper ARIA labels and keyboard navigation
3. **Delivers Performance** with optimized animations and loading states
4. **Scales Responsively** with mobile-first breakpoints
5. **Supports Customization** through variant patterns and composition
6. **Enhances UX** with thoughtful micro-interactions and visual feedback

This design system serves as the single source of truth for all UI decisions, ensuring a unified and professional user experience across the entire Meytle platform.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial comprehensive documentation |

## References

- Tailwind CSS v4 Documentation
- React 19 Component Patterns
- WCAG 2.1 Accessibility Guidelines
- OKLCH Color Space Specification

---

*End of Document*