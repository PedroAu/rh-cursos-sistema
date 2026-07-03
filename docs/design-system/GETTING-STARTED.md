# Getting Started with site-rh-cursos Design System

**For developers new to the design system or looking for quick start patterns**

---

## 5-Minute Setup

### 1. Understand the Design Philosophy

Our design system uses **Atomic Design** — components built in layers:

```
Atoms (Button, Input)
  ↓
Molecules (FormField, Card)
  ↓
Organisms (Header, CourseCard)
```

### 2. Import Components

```tsx
// Form components
import { MantineFormFieldText } from '@/components/ui/form-field';

// Card components
import { Card, CardContent } from '@/components/ui/card';

// Domain-specific
import { CourseCard } from '@/components/courses/course-card';
import { ClassCard } from '@/components/agenda/class-card';
```

### 3. Use Tokens for Styling

```tsx
// ✅ Good: Use design tokens (CSS variables)
<div className="p-4 gap-6 text-foreground bg-secondary">
  ...
</div>

// ❌ Avoid: Hardcoded colors
<div style={{ backgroundColor: '#004364', color: '#ffffff' }}>
  ...
</div>
```

---

## Common Tasks

### Task 1: Create a Simple Form

```tsx
import { MantineFormFieldText, MantineFormFieldSelect } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function UserForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, category });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MantineFormFieldText
        label="Full Name"
        placeholder="John Doe"
        value={name}
        onChange={setName}
        size="md"
        required
      />

      <MantineFormFieldSelect
        label="Category"
        data={[
          { value: 'tech', label: 'Technology' },
          { value: 'business', label: 'Business' },
        ]}
        value={category}
        onChange={setCategory}
        size="md"
        required
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

**Key Points:**
- `onChange` receives the value directly (not the event)
- `size="md"` is default, use `"sm"` for compact or `"lg"` for spacious
- All labels are automatically connected to inputs

### Task 2: Display a Grid of Cards

```tsx
import { Card, CardContent } from '@/components/ui/card';

export function CourseGrid({ courses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card 
          key={course.id}
          variant="elevated"
          interactive={true}
          size="md"
          className="group overflow-hidden transition hover:-translate-y-1"
        >
          <div className="aspect-video bg-secondary" />
          <CardContent className="space-y-4 p-4">
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground">{course.description}</p>
            <p className="text-sm font-semibold text-tk-brand">{course.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Key Points:**
- `variant="elevated"` creates a shadow effect (most common)
- `interactive={true}` adds hover effects
- Use `space-y-4` for consistent vertical spacing
- Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop

### Task 3: Build a Featured Card

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function FeaturedCard() {
  return (
    <Card 
      variant="filled" 
      interactive={false} 
      size="lg"
      className="bg-gradient-to-r from-tk-brand to-tk-accent text-white"
    >
      <CardContent className="py-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Limited Time Offer</h2>
        <p className="text-lg opacity-90">Get 50% off on all courses this month</p>
        <Button variant="secondary" size="lg">
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Key Points:**
- `variant="filled"` for prominent, featured sections
- `interactive={false}` when the card is not clickable
- Add custom gradient with `className` for emphasis
- Use `text-white` and opacity utilities on colored backgrounds

### Task 4: Handle Form Validation

```tsx
import { MantineFormFieldText } from '@/components/ui/form-field';
import { useState } from 'react';

export function EmailForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (value) => {
    setEmail(value);
    validateEmail(value);
  };

  return (
    <MantineFormFieldText
      label="Email Address"
      type="email"
      value={email}
      onChange={handleChange}
      error={error}
      size="md"
    />
  );
}
```

**Key Points:**
- Pass error string to show validation message below input
- Validate on change for real-time feedback
- Clear error when validation passes

---

## Design Token Reference

### Quick Color Tokens

```tsx
// Primary brand color
className="text-tk-brand bg-tk-brand/10"  // Deep Teal

// Secondary supporting color
className="text-tk-accent-strong bg-tk-accent-soft"  // Accent + soft tint

// Status colors
className="text-tk-success"  // Success
className="text-[#7a5600]"   // Warning
className="text-tk-error"    // Error

// Text colors
className="text-tk-ink"         // Main text
className="text-tk-ink-muted"   // Secondary text

// Neutral
className="bg-tk-surface"  // White
className="border-tk-line" // Light border
```

### Quick Spacing Tokens

```tsx
// Padding/Margin
className="p-2"    // 8px
className="p-4"    // 16px
className="p-6"    // 24px

className="space-y-4"  // Vertical gap 16px
className="gap-6"      // Horizontal/vertical gap 24px

// Common patterns
className="px-4 py-6"      // Horizontal 16px, vertical 24px
className="p-6 space-y-4"  // Inside 24px, children gap 16px
```

### Quick Typography Tokens

```tsx
// Font sizes
className="text-xs"      // 12px (labels)
className="text-sm"      // 14px (body)
className="text-base"    // 16px (default)
className="text-lg"      // 18px (titles)
className="text-2xl"     // 24px (headings)

// Font weights
className="font-medium"   // 500 (slightly bold)
className="font-semibold" // 600 (bold)
className="font-bold"     // 700 (very bold)

// Line height
className="leading-tight"    // Compact
className="leading-normal"   // Default
className="leading-relaxed"  // Spacious
```

---

## Component API Reference

### FormField Components

```tsx
<MantineFormFieldText
  label="string"              // Field label
  placeholder="string"        // Input placeholder
  value="string"              // Current value
  onChange={(value) => {}}    // Value change handler
  error="string"              // Error message (shown if truthy)
  required={boolean}          // Mark as required
  disabled={boolean}          // Disable input
  type="text|email|number"   // Input type
  size="sm|md|lg"            // Height: 32|40|48px
/>

<MantineFormFieldSelect
  label="string"
  data={[{ value: string, label: string }]}  // Options array
  value="string"
  onChange={(value) => {}}
  searchable={boolean}        // Enable search
  clearable={boolean}         // Show clear button
  error="string"
  size="sm|md|lg"
/>

<MantineFormFieldTextarea
  label="string"
  placeholder="string"
  value="string"
  onChange={(value) => {}}
  minRows={number}            // Minimum visible rows
  error="string"
  size="sm|md|lg"
/>

<MantineFormFieldMultiSelect
  label="string"
  data={[{ value: string, label: string }]}
  value={string[]}
  onChange={(values) => {}}
  searchable={boolean}
  clearable={boolean}
  error="string"
  size="sm|md|lg"
/>
```

### Card Components

```tsx
<Card
  variant="base|elevated|outlined|filled"  // Visual style
  interactive={boolean}                     // Enable hover effects
  size="sm|md|lg"                          // Padding size
  className="string"                        // Additional classes
>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer content (optional) */}
  </CardFooter>
</Card>
```

**Variant Guidance:**
- `elevated` (shadow): Default for most cards, good depth perception
- `outlined` (border): For secondary content, testimonials
- `filled` (background): For featured, prominent sections
- `base` (minimal): Simple containers, blog post cards

---

## Common Patterns

### Form Row

```tsx
<div className="grid grid-cols-2 gap-6">
  <MantineFormFieldText label="First Name" size="md" />
  <MantineFormFieldText label="Last Name" size="md" />
</div>
```

### Card with Image Header

```tsx
<Card variant="elevated" interactive={true} size="md">
  <img src="image.jpg" className="w-full h-48 object-cover" />
  <CardContent className="space-y-4 p-6">
    <h3 className="font-bold text-lg">Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

### Status Badge on Card

```tsx
import { Badge } from '@/components/ui/badge';

<Card variant="outlined">
  <CardContent className="space-y-4 p-6">
    <div className="flex items-center justify-between">
      <h3>Item Title</h3>
      <Badge variant="secondary">Active</Badge>
    </div>
  </CardContent>
</Card>
```

### Empty State

```tsx
<Card variant="outlined" interactive={false} size="lg" className="text-center">
  <CardContent className="py-12">
    <h3 className="text-lg font-bold mb-2">No items found</h3>
    <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
    <Button variant="outline">Reset Filters</Button>
  </CardContent>
</Card>
```

---

## Accessibility Checklist

### For Every Form

- [ ] Label is connected to input (`<MantineFormField...` does this)
- [ ] Error message is visible and clear
- [ ] Required fields are marked
- [ ] Form can be submitted with keyboard (Tab + Enter)

### For Every Card

- [ ] Has a semantic heading (`<h2>`, `<h3>`, etc.)
- [ ] Interactive cards are keyboard accessible
- [ ] Color alone doesn't convey information
- [ ] Text has sufficient contrast (4.5:1 minimum)

### Testing Accessibility

```bash
# Run accessibility checks
npm run test:a11y

# Test keyboard navigation
# 1. Tab through form fields
# 2. Verify focus indicators visible
# 3. Test Enter/Space on buttons
```

---

## Troubleshooting

### Issue: Input looks weird in form

**Check:**
- Are you using `MantineFormFieldText`? (not raw `<input>`)
- Is `onChange` receiving the value? (should be string, not event)
- Is the parent form properly structured?

```tsx
// ❌ Wrong
<input 
  onChange={(e) => setValue(e.target.value)}  // Extracting value
  style={{ /* inline styles */ }}
/>

// ✅ Right
<MantineFormFieldText
  onChange={(value) => setValue(value)}  // Direct value
  size="md"  // Use token size
/>
```

### Issue: Card spacing looks wrong

**Check:**
- Did you use `CardContent`? (adds padding)
- Did you add custom padding? (might double-pad)
- Are children using consistent spacing?

```tsx
// ❌ Wrong
<Card>
  <CardContent className="p-0">  {/* Removes default padding */}
    <div className="p-6">        {/* Custom padding instead */}
```

// ✅ Right
<Card>
  <CardContent className="space-y-4">  {/* Use space-y for children gap */}
    <h3>Title</h3>
    <p>Content</p>
  </CardContent>
</Card>
```

### Issue: Form field error isn't showing

**Check:**
- Is `error` prop a string? (must be truthy string, not boolean)
- Is error being set correctly?

```tsx
// ❌ Wrong
<MantineFormFieldText error={hasError} />  // Boolean

// ✅ Right
<MantineFormFieldText error={hasError ? "This field is required" : ""} />
```

---

## When to Ask for Help

- **Design questions:** Check [PATTERN-LIBRARY.md](./PATTERN-LIBRARY.md)
- **Component prop questions:** Check component source in `src/components/ui/`
- **Token values:** Check `src/design-tokens/tokens.css`
- **Accessibility issues:** Check WCAG guidelines or run a11y tests
- **Something doesn't match the design:** File an issue with screenshot

---

## What's Next

1. ✅ Read this guide
2. ✅ Try Task 1: Create a Simple Form
3. ✅ Try Task 2: Display a Grid of Cards
4. 🎯 Build your feature using patterns above
5. 📝 Keep component props consistent across your code
6. ♿ Verify accessibility before shipping

---

**Need help? Reference [PATTERN-LIBRARY.md](./PATTERN-LIBRARY.md) or check component source code.**

*Happy building! 🚀*
