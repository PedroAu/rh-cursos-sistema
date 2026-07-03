# Form Design Guide — Trust Keith System

**Status:** Architecture Ready  
**Author:** @architect (Aria)  
**Date:** 2026-06-29  
**Consumer:** @dev (Task #3 — Form Styling Consolidation)  
**Design System:** Trust Keith

---

## Executive Summary

This guide consolidates form styling using the **Trust Keith design token system**. It provides:

1. ✅ **Token-based form patterns** — Colors, spacing, typography
2. 🎨 **Component specifications** — FormControl, FormSection, FormField
3. 📐 **Accessibility requirements** — ARIA attributes, keyboard navigation
4. 🎯 **Implementation patterns** — Best practices for @dev

---

## Part 1: Design Tokens (Trust Keith)

### 1.1 Form Color Palette

| Token | Value | Usage | CSS Variable |
|-------|-------|-------|-------------|
| **tk-ink** | #222525 | Labels, field text | `var(--tk-ink)` |
| **tk-ink-muted** | #4f5057 | Hints, descriptions | `var(--tk-ink-muted)` |
| **tk-surface** | #ffffff | Input backgrounds | `var(--tk-surface)` |
| **tk-surface-2** | #fafafa | Form section backgrounds | `var(--tk-surface-2)` |
| **tk-success** | #068466 | Success states, checkmarks | `var(--tk-success)` |
| **tk-error** | #ea384c | Error states, validation | `var(--tk-error)` |
| **tk-line** | #ebebeb | Borders, dividers | `var(--tk-line)` |
| **tk-focus** | #4d65ff | Focus ring, highlights | `var(--tk-focus)` |
| **tk-brand** | #0c6a83 | Primary CTA buttons | `var(--tk-brand)` |

### 1.2 Form Spacing Scale

| Token | Size | Usage |
|-------|------|-------|
| **xs** | 4px | Micro spacing (checkbox padding) |
| **sm** | 8px | Label to field, hints below labels |
| **md** | 16px | Field to field vertical, form padding |
| **lg** | 24px | Section spacing, group spacing |
| **xl** | 32px | Major section breaks |
| **2xl** | 48px | Form to header spacing |

**Base Unit:** 4px grid system

### 1.3 Form Border Radius

| Token | Radius | Usage |
|-------|--------|-------|
| **input** | 4px | Text inputs, textareas (utilitarian) |
| **button** | 6px | Form buttons, select boxes |
| **card** | 24px | Form containers, card sections |

### 1.4 Form Typography

| Element | Token | Font | Weight | Size | Line Height |
|---------|-------|------|--------|------|-------------|
| **Label** | `text-label-bold` | Inter | 600 | 0.875rem | 1.2 |
| **Field Text** | `body` | Inter | 400 | 1rem | 1.5 |
| **Hint Text** | `body-small` | Inter | 400 | 0.875rem | 1.4 |
| **Error Message** | `caption` | Inter | 400 | 0.75rem | 1.2 |
| **Required Indicator** | `caption` | Inter | 700 | 0.75rem | 1.2 |

### 1.5 Form Shadows

| Token | Shadow | Usage |
|-------|--------|-------|
| **focus** | `0.125rem solid var(--tk-focus)` | Focus ring (input states) |
| **ambient** | `0 4px 16px rgba(0, 0, 0, 0.08)` | Form container shadows |
| **standard** | `0 2px 16px rgba(0, 0, 0, 0.02), 0 16px 64px rgba(0, 0, 0, 0.12)` | Dropdown shadows |

---

## Part 2: Form Component Specifications

### 2.1 FormControl Component

**Purpose:** Wrapper for a single form field with label, hint, and error messaging.

**Props:**
```typescript
interface FormControlProps {
  label?: string;           // Field label (e.g., "Email Address")
  required?: boolean;       // Show required asterisk
  error?: string;           // Error message (disables field)
  hint?: string;            // Helper text below field
  id?: string;              // Input ID (auto-generated if omitted)
  state?: 'default' | 'error' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode; // The input element (input, select, textarea)
}
```

**Structure:**
```
┌─────────────────────────────┐
│ Email Address *             │  ← Label (text-label-bold)
│ [            ]              │  ← Input (with focus ring)
│ Enter your email address    │  ← Hint (tk-ink-muted)
│ This field is required      │  ← Error (tk-error)
└─────────────────────────────┘
```

**Spacing Rules:**
- Label to input: `sm` (8px)
- Input to hint: `sm` (8px)
- Hint to error: `xs` (4px)
- FormControl to next control: `md` (16px)

**Accessibility:**
- `aria-describedby` links to hint + error IDs
- `aria-invalid={Boolean(error)}` on input
- Error has `role="alert"` for screen readers

**State Styling:**

| State | Text Color | Border Color | Background | Focus Ring |
|-------|-----------|--------------|------------|-----------|
| **default** | tk-ink | tk-line | tk-surface | tk-focus |
| **error** | tk-error | tk-error | tk-error (opacity 8%) | tk-error |
| **success** | tk-success | tk-success | tk-success (opacity 5%) | tk-success |
| **warning** | warning (gold) | warning | warning (opacity 5%) | warning |

**Example Usage:**
```tsx
<FormControl
  id="email"
  label="Email Address"
  required
  hint="We'll never share your email"
  error={errors.email ? "Invalid email format" : undefined}
>
  <input
    type="email"
    placeholder="you@example.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormControl>
```

### 2.2 FormSection Component

**Purpose:** Group related form fields into semantic sections with optional heading.

**Props:**
```typescript
interface FormSectionProps {
  label?: string;           // Section heading
  description?: string;     // Section description (subtitle)
  variant?: 'default' | 'card' | 'outlined';
  children: React.ReactNode;
}
```

**Variants:**

| Variant | Background | Border | Padding | Usage |
|---------|-----------|--------|---------|-------|
| **default** | transparent | none | none | Logical grouping, no visual separation |
| **card** | tk-surface-2 | 1px tk-line | 24px (lg) | Emphasized grouping (profile section) |
| **outlined** | transparent | 2px tk-line | 16px (md) | Important sections (payment info) |

**Spacing:**
- Section to section: `xl` (32px)
- Section heading to content: `md` (16px)
- Section heading font: `section-heading` (2rem, 700 weight)
- Section description font: `body-small` (secondary color)

**Example Usage:**
```tsx
<FormSection 
  label="Contact Information"
  description="How we'll reach you"
  variant="card"
>
  <FormControl label="Email" hint="Work email preferred">
    <input type="email" />
  </FormControl>
  <FormControl label="Phone">
    <input type="tel" />
  </FormControl>
</FormSection>
```

### 2.3 Form Component (Container)

**Purpose:** Root form element with optional layout control.

**Props:**
```typescript
interface FormProps {
  layout?: 'vertical' | 'horizontal' | 'grid';
  children: React.ReactNode;
  onSubmit?: (e: FormEvent) => void;
}
```

**Layout Options:**

| Layout | Behavior | Use Case |
|--------|----------|----------|
| **vertical** | Single column, `gap-md` (16px) | Most forms (default) |
| **horizontal** | Row with flex wrap, `gap-sm` (8px) | Compact forms (filters) |
| **grid** | CSS grid, `grid-cols-1 md:grid-cols-2` | Multicolumn forms |

**Example Usage:**
```tsx
<Form onSubmit={handleSubmit} layout="vertical">
  <FormSection label="Personal Information">
    <FormControl label="First Name" required>
      <input type="text" />
    </FormControl>
    <FormControl label="Last Name" required>
      <input type="text" />
    </FormControl>
  </FormSection>

  <FormSection label="Address" variant="card">
    <FormControl label="Street Address" required>
      <input type="text" />
    </FormControl>
  </FormSection>

  <button type="submit">Submit</button>
</Form>
```

---

## Part 3: Input Field Styling

### 3.1 Text Input (`<input type="text" />`)

**Base Styling:**
```css
border-radius: var(--tk-radius-input); /* 4px */
border: 1px solid var(--tk-line);
padding: var(--tk-space-4) var(--tk-space-4); /* 16px */
font-family: var(--tk-font-body);
font-size: 1rem;
line-height: 1.5;
color: var(--tk-ink);
background-color: var(--tk-surface);
transition: all 200ms ease-in-out;
```

**States:**
- **Default:** Border tk-line, no outline
- **Hover:** Border tk-line (no change per Trust Keith)
- **Focus:** Border tk-focus, outline 2px offset 2px (focus ring shadow)
- **Error:** Border tk-error, error message shown below
- **Disabled:** Background tk-surface-2, color tk-ink-muted (opacity 60%)
- **Placeholder:** tk-ink-muted (opacity 60%)

### 3.2 Select (`<select>`)

**Base Styling:**
```css
border-radius: var(--tk-radius-button); /* 6px */
border: 1px solid var(--tk-line);
padding: var(--tk-space-2) var(--tk-space-4); /* 8px 16px */
font-size: 0.875rem;
color: var(--tk-ink);
background-color: var(--tk-surface);
background-image: url('data:image/svg+xml...');
background-position: right 8px center;
padding-right: 28px;
cursor: pointer;
```

**Dropdown Arrow:**
- SVG chevron (dark tk-ink-muted)
- Position: right 8px, center vertically
- Only visible in closed state

### 3.3 Textarea (`<textarea>`)

**Base Styling:**
```css
border-radius: var(--tk-radius-input); /* 4px */
border: 1px solid var(--tk-line);
padding: var(--tk-space-4); /* 16px */
font-family: var(--tk-font-body);
font-size: 1rem;
line-height: 1.5;
min-height: 120px;
resize: vertical;
```

**Resize Behavior:**
- Allow vertical resize only
- Minimum height 120px (7.5 lines at 1rem)
- Max width 100% of container

### 3.4 Checkbox & Radio

**Checkbox:**
```css
width: 20px;
height: 20px;
border-radius: var(--tk-radius-button); /* 6px */
border: 2px solid var(--tk-line);
cursor: pointer;
accent-color: var(--tk-brand);
```

**Radio:**
```css
width: 20px;
height: 20px;
border-radius: var(--tk-radius-pill); /* 100% */
border: 2px solid var(--tk-line);
cursor: pointer;
accent-color: var(--tk-brand);
```

---

## Part 4: Keyboard Navigation

### 4.1 Focus Management

**Focus Order:**
1. Form label (not focusable)
2. Input/select/textarea
3. Hint text (not focusable)
4. Error message (role="alert")
5. Next field

**Focus Indicators:**
- **Outline:** 2px solid tk-focus (#4d65ff)
- **Offset:** 2px from element edge
- **Transition:** 200ms ease-in-out (smooth appearance)
- **Contrast:** Minimum 3:1 (meets WCAG AA)

**Tab Order:**
```
FormControl #1 Input → FormControl #2 Input → FormControl #3 Input → Submit Button
```

### 4.2 Dialog Forms

**Focus Trap Pattern:**
- On open: Focus shifts to first input
- TAB/Shift+TAB: Cycles through focusable elements within dialog
- ESC: Closes dialog, restores focus to trigger

**Implementation:** Use `useFocusTrap()` hook from `/src/lib/keyboard-navigation.ts`

```tsx
import { useFocusTrap } from '@/lib/keyboard-navigation';

export function FormDialog() {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { handleKeyDown } = useFocusTrap(dialogRef, onClose);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div ref={dialogRef} onKeyDown={handleKeyDown}>
          <Form>{/* fields */}</Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Part 5: Accessibility Checklist

### 5.1 WCAG 2.1 AA Compliance

- [ ] All labels associated with inputs via `<label htmlFor>` or FormControl wrapper
- [ ] Required fields marked with visual indicator (*) and `required` attribute
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages have `role="alert"` for immediate announcement
- [ ] Inputs have `aria-invalid="true"` when error state active
- [ ] Placeholder text is NOT a substitute for labels
- [ ] Hint text linked via `aria-describedby`
- [ ] Color is not the only indicator of state (icon + text used)
- [ ] Focus indicator visible (minimum 3px, 3:1 contrast)
- [ ] Form can be submitted via Enter key
- [ ] Validation errors shown before submission

### 5.2 ARIA Attributes

| Attribute | Value | When |
|-----------|-------|------|
| `aria-label` | "Email Address" | Label not visible |
| `aria-labelledby` | "label-id" | Label via ID reference |
| `aria-describedby` | "hint-id error-id" | Multiple descriptions |
| `aria-invalid` | "true" | Error state active |
| `aria-required` | "true" | Required field |
| `aria-disabled` | "true" | Disabled state |

---

## Part 6: Implementation Checklist for @dev

### 6.1 Create/Update Components

**File:** `/src/components/ui/form-base.tsx`

- [ ] FormControl component with label, hint, error, state management
- [ ] FormSection component with variant support (default, card, outlined)
- [ ] Form container component with layout support (vertical, horizontal, grid)
- [ ] All components accept `className` prop for Tailwind overrides
- [ ] All components use `cn()` utility for classname merging

**File:** `/src/components/ui/form-field.tsx` (Mantine integration)

- [ ] FormField wrapper for Mantine TextInput, Select, Textarea
- [ ] Integrate with Mantine form context
- [ ] Support Mantine validation styles
- [ ] Connect error messages to Mantine error state

### 6.2 Styling Guidelines

**Use Tailwind CSS for:**
- Spacing (gap-, p-, m-)
- Layout (flex, grid)
- Colors (from tokens)
- Typography (text-, font-)
- Borders (border-, rounded-)

**Use CSS Variables for:**
- Color values: `var(--tk-ink)`
- Spacing: `var(--tk-space-4)`
- Border radius: `var(--tk-radius-input)`
- Shadows: `var(--tk-focus-ring)`

**Example:**
```tsx
export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ label, error, hint, children, ...props }, ref) => (
    <div ref={ref} className="flex flex-col gap-2">
      {label && (
        <label className="text-label-bold font-semibold text-tk-ink">
          {label}
          {required && <span className="ml-1 text-tk-error">*</span>}
        </label>
      )}
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              'aria-invalid': Boolean(error),
              'aria-describedby': [hint && 'hint-id', error && 'error-id'].filter(Boolean).join(' '),
            } as any);
          }
          return child;
        })}
      </div>
      {hint && <p className="text-body-small text-tk-ink-muted">{hint}</p>}
      {error && <p className="text-caption text-tk-error" role="alert">{error}</p>}
    </div>
  )
);
```

### 6.3 Testing Requirements

- [ ] Unit tests for FormControl, FormSection, Form components
- [ ] Accessibility tests with @axe-core/playwright
- [ ] Keyboard navigation tests (Tab, Shift+Tab, Enter)
- [ ] Focus management tests (focus restoration)
- [ ] Error state rendering tests
- [ ] Mantine integration tests

**Run:** `npm run test:unit` and `npm run test:a11y`

### 6.4 Storybook Documentation

- [ ] FormControl stories (default, error, success, warning, with hint)
- [ ] FormSection stories (default, card, outlined variants)
- [ ] Form layout stories (vertical, horizontal, grid)
- [ ] Accessibility panel in Storybook showing ARIA attributes
- [ ] Live code examples for each component

**Build:** `npm run storybook:build`

---

## Part 7: Migration Path from Current Forms

**Current State:** Forms use Mantine TextInput, Select directly (no consistent wrapper)

**Phase A Target:** ✅ Standardize with FormControl wrapper

**Steps:**
1. Create `/src/components/ui/form-base.tsx` (done ✅)
2. Update all form pages to use FormControl
3. Add Storybook stories for documentation
4. Run accessibility audit

**Pages to Update:**
- `/app/cursos/page.tsx` → Course filters
- `/app/contato/page.tsx` → Contact form
- `/app/falar-com-especialista/page.tsx` → Expert request form
- `/app/admin/page.tsx` → Admin forms (leads, courses, students)

---

## Part 8: Design System Resources

**Design Token System:**
- File: `/src/design-tokens/tokens.tailwind.js`
- CSS Variables: `/src/design-tokens/tokens.css`
- Tailwind Config: `/tailwind.config.ts`

**Related Components:**
- Keyboard Navigation: `/src/lib/keyboard-navigation.ts`
- Utility Functions: `/src/lib/utils.ts`

**Documentation:**
- Storybook: `npm run storybook` (port 6006)
- Lighthouse Audit: `npm run test:lighthouse`

---

## References

- **Design Tokens:** `/src/design-tokens/tokens.tailwind.js`
- **Existing Form Component:** `/src/components/ui/form-base.tsx`
- **Mantine Integration:** `/src/components/providers/mantine-provider.tsx`
- **Accessibility:** `/src/lib/keyboard-navigation.ts`
- **Tailwind Config:** `/tailwind.config.ts`

---

**Next Step:** @dev implements Task #3 (Form Styling Consolidation) using this guide. Handoff in `.aiox/handoffs/`
