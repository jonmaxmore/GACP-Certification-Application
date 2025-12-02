# Next.js + Tailwind CSS Guide

## 🎨 Your Current Setup

Frontend ของคุณใช้ **Next.js 14 + Tailwind CSS** อยู่แล้ว พร้อมใช้งานทันที!

### ✅ Installed Packages

```json
{
  "next": "14.2.18",
  "tailwindcss": "^3.4.17",
  "postcss": "^8.4.49",
  "autoprefixer": "^10.4.20"
}
```

### 📁 Configuration Files

1. **tailwind.config.ts** - Tailwind configuration with custom GACP colors
2. **postcss.config.mjs** - PostCSS configuration
3. **app/globals.css** - Global styles with Tailwind directives

---

## 🚀 How to Use Tailwind CSS

### 1. Basic Utility Classes

```tsx
// Spacing
<div className="p-4 m-2">Padding & Margin</div>
<div className="px-6 py-3">Horizontal & Vertical spacing</div>

// Colors
<div className="bg-green-600 text-white">Background & Text</div>
<div className="bg-gradient-to-r from-green-500 to-blue-500">Gradient</div>

// Layout
<div className="flex items-center justify-between">Flexbox</div>
<div className="grid grid-cols-3 gap-4">Grid Layout</div>

// Sizing
<div className="w-full h-screen">Full width & height</div>
<div className="w-1/2 h-64">Half width & fixed height</div>

// Borders & Shadows
<div className="rounded-lg shadow-md border border-gray-200">Card</div>
```

### 2. Responsive Design

```tsx
// Mobile-first approach
<div
  className="
  w-full          // Mobile: full width
  md:w-1/2        // Tablet: half width
  lg:w-1/3        // Desktop: one-third width
  xl:w-1/4        // Large: one-fourth width
"
>
  Responsive Element
</div>

// Breakpoints
// sm:  640px  (Small tablets)
// md:  768px  (Tablets)
// lg:  1024px (Laptops)
// xl:  1280px (Desktops)
// 2xl: 1536px (Large desktops)
```

### 3. Custom GACP Colors

Your project has custom color palette:

```tsx
// Primary (Green)
<div className="bg-primary-500">Main Green</div>
<div className="bg-primary-100">Light Green</div>
<div className="bg-primary-900">Dark Green</div>

// Secondary (Orange)
<div className="bg-secondary-500">Main Orange</div>

// Status Colors
<div className="bg-success-main">Success Green</div>
<div className="bg-warning-main">Warning Orange</div>
<div className="bg-error-main">Error Red</div>
```

### 4. Common Patterns

#### Card Component

```tsx
<div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
  <h3 className="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

#### Button Component

```tsx
// Primary Button
<button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
  Click Me
</button>

// Outline Button
<button className="px-6 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
  Outline
</button>
```

#### Alert Box

```tsx
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
  <div className="flex items-start">
    <CheckIcon className="text-green-600 w-5 h-5" />
    <p className="ml-3 text-sm text-green-700">Success message</p>
  </div>
</div>
```

#### Form Input

```tsx
<input
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
  placeholder="Enter text"
/>
```

---

## 📋 Example Page

ตัวอย่างที่สร้างให้แล้ว: **`/examples`**

เข้าดูได้ที่: http://localhost:3001/examples

มี 3 sections:

1. **Components** - Alert cards, stat cards, buttons
2. **Layouts** - Grid, flexbox layouts
3. **Forms** - Input fields, selects, textarea

---

## 🎯 Best Practices

### 1. Use Composition

```tsx
// Create reusable components
const Card = ({ children }) => <div className="bg-white rounded-xl shadow-md p-6">{children}</div>;

const Button = ({ variant = 'primary', children }) => {
  const classes =
    variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  return (
    <button className={`px-6 py-2 rounded-lg transition-colors ${classes}`}>{children}</button>
  );
};
```

### 2. Use clsx for Conditional Classes

```tsx
import clsx from 'clsx';

const Button = ({ primary, disabled }) => (
  <button
    className={clsx(
      'px-6 py-2 rounded-lg transition-colors',
      primary ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    Button
  </button>
);
```

### 3. Use Tailwind Merge

```tsx
import { cn } from '@/lib/utils'; // Using tailwind-merge

const Card = ({ className, children }) => (
  <div className={cn('bg-white rounded-xl shadow-md p-6', className)}>{children}</div>
);

// Usage
<Card className="bg-green-50">Custom background</Card>;
```

---

## 🔥 Pro Tips

1. **Use @apply in CSS** for repeated patterns:

```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors;
  }
}
```

2. **Dark Mode Support**:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Dark mode compatible</div>
```

3. **Animations**:

```tsx
<div className="animate-pulse">Loading...</div>
<div className="animate-bounce">Bouncing</div>
<div className="animate-spin">Spinning</div>
```

4. **Hover & Focus States**:

```tsx
<button
  className="
  bg-green-600 
  hover:bg-green-700 
  focus:ring-2 
  focus:ring-green-500 
  active:scale-95 
  transition-all
"
>
  Interactive Button
</button>
```

---

## 📚 Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Tailwind UI Components**: https://tailwindui.com
- **Flowbite Components**: https://flowbite.com
- **Headless UI**: https://headlessui.com (for accessible components)

---

## 🎨 GACP Color Palette

```typescript
// From your tailwind.config.ts
primary: {
  500: '#4caf50', // Main green - Use for primary actions
}

secondary: {
  500: '#ff9800', // Main orange - Use for secondary actions
}

success: '#4caf50',  // Green for success states
warning: '#ff9800',  // Orange for warnings
error: '#f44336',    // Red for errors
info: '#2196f3',     // Blue for info
```

---

ใช้ Tailwind ได้เต็มที่เลย! 🚀
