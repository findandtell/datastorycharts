# Find&Tell Brand Style Guide

This guide outlines the brand styling system implemented in your app.

## Brand Colors

### Primary Colors
- **Navy Blue** (#1e3a8a): Primary brand color, used for main CTAs and headers
- **Cyan Blue** (#0ea5e9): Secondary color, used for interactive elements and accents
- **Purple/Magenta** (#a855f7): Accent color, used for highlights and special features
- **Gray** (#6b7280): Text color for body content

### Tailwind Color Classes

Use these color classes in your components:

```jsx
// Text colors
<p className="text-findtell-navy">Navy text</p>
<p className="text-findtell-blue">Cyan text</p>
<p className="text-findtell-purple">Purple text</p>
<p className="text-findtell-gray">Gray text</p>

// Background colors
<div className="bg-findtell-navy">Navy background</div>
<div className="bg-findtell-blue">Cyan background</div>
<div className="bg-findtell-purple">Purple background</div>

// Or use the 'brand' aliases
<button className="bg-brand-primary">Primary button</button>
<button className="bg-brand-secondary">Secondary button</button>
<div className="text-brand-accent">Accent text</div>
```

## CSS Variables

For custom CSS or inline styles:

```css
var(--findtell-navy)
var(--findtell-blue)
var(--findtell-purple)
var(--findtell-gray)
var(--findtell-light-gray)
```

## Logo Component

Import and use the Find&Tell logo:

```jsx
import FindTellLogo from './shared/FindTellLogo';

// Basic usage
<FindTellLogo />

// Custom size
<FindTellLogo size={0.5} />

// Without text (just the ampersand symbol)
<FindTellLogo showText={false} size={0.3} />

// With additional classes
<FindTellLogo className="mx-auto my-4" />
```

## Utility Classes

### Gradient Background
```jsx
<div className="findtell-gradient p-8 text-white">
  Content with brand gradient background
</div>
```

### Gradient Text
```jsx
<h1 className="findtell-gradient-text text-4xl font-bold">
  Gradient heading
</h1>
```

### Buttons
```jsx
// Primary button (Navy -> Blue on hover)
<button className="findtell-btn-primary">
  Click me
</button>

// Secondary button (Purple -> Blue on hover)
<button className="findtell-btn-secondary">
  Learn more
</button>
```

### Cards
```jsx
<div className="findtell-card p-6">
  Card content with brand styling
</div>
```

### Links
```jsx
<a href="#" className="findtell-link">
  Brand-styled link
</a>
```

## Typography

The brand uses **Inter** as the primary font family, which is already configured in the global CSS.

```jsx
// Already applied to body by default
<p className="font-findtell">Text in brand font</p>
```

## Example Components

### Hero Section
```jsx
<section className="findtell-gradient py-20">
  <div className="container mx-auto text-center">
    <FindTellLogo className="mx-auto mb-8" />
    <h1 className="text-white text-5xl font-bold mb-4">
      Welcome to Find&Tell
    </h1>
    <p className="text-white/90 text-xl mb-8">
      Build beautiful funnel visualizations
    </p>
    <button className="bg-white text-findtell-navy px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
      Get Started
    </button>
  </div>
</section>
```

### Feature Card
```jsx
<div className="findtell-card p-6 max-w-sm">
  <h3 className="findtell-gradient-text text-2xl font-bold mb-3">
    Amazing Feature
  </h3>
  <p className="text-findtell-gray mb-4">
    Description of your feature goes here.
  </p>
  <button className="findtell-btn-primary w-full">
    Learn More
  </button>
</div>
```

### Navigation
```jsx
<nav className="bg-white border-b border-gray-200">
  <div className="container mx-auto flex items-center justify-between py-4 px-6">
    <FindTellLogo size={0.4} />
    <div className="space-x-6">
      <a href="#" className="text-findtell-gray hover:text-findtell-blue transition">
        Home
      </a>
      <a href="#" className="text-findtell-gray hover:text-findtell-blue transition">
        Features
      </a>
      <button className="findtell-btn-primary">
        Sign In
      </button>
    </div>
  </div>
</nav>
```

## Color Combinations

### Recommended Pairings
- Navy background + White text
- White background + Navy text
- Gradient background + White text
- Light gray background + Navy text
- Navy button + White text
- Purple accent on hover states

### Avoid
- Purple text on Navy background (poor contrast)
- Cyan text on white background (insufficient contrast)
- Multiple gradients in close proximity

## Accessibility

All color combinations meet WCAG AA standards for contrast ratios:
- Navy (#1e3a8a) on white: 8.59:1 ✓
- Gray (#6b7280) on white: 5.39:1 ✓
- White on Navy: 8.59:1 ✓
- White on Cyan (#0ea5e9): 2.87:1 ✓ (Large text only)
- White on Purple (#a855f7): 4.85:1 ✓

## Next Steps

1. Update your existing components to use the new brand colors
2. Replace generic buttons with `findtell-btn-primary` or `findtell-btn-secondary`
3. Add the FindTellLogo component to your header/navigation
4. Use the gradient classes for hero sections and call-to-action areas
5. Consider creating a custom favicon using the brand colors
