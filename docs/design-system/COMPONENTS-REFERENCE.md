# Component Reference — Quick Lookup

**One-page cheat sheet for all components in the design system**

---

## Form Components

### MantineFormFieldText
**File:** `src/components/ui/form-field.tsx`

```tsx
<MantineFormFieldText
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChange={(value) => setEmail(value)}
  type="email"
  size="md"
  error={emailError}
  required
  disabled={false}
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | Field label (required) |
| `placeholder` | string | — | Input placeholder text |
| `value` | string | — | Current value (required) |
| `onChange` | function | — | Called with value string (required) |
| `type` | text\|email\|number\|password | text | HTML input type |
| `size` | sm\|md\|lg | md | Height: 32\|40\|48px |
| `error` | string | "" | Error message (shows if truthy) |
| `required` | boolean | false | Mark required with asterisk |
| `disabled` | boolean | false | Disable input |

---

### MantineFormFieldSelect
**File:** `src/components/ui/form-field.tsx`

```tsx
<MantineFormFieldSelect
  label="Category"
  data={[
    { value: 'cat1', label: 'Category 1' },
    { value: 'cat2', label: 'Category 2' }
  ]}
  value={category}
  onChange={(value) => setCategory(value)}
  searchable
  clearable
  size="md"
  error={categoryError}
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | Field label (required) |
| `data` | array | — | Options: `[{ value, label }, ...]` (required) |
| `value` | string | null | Selected value |
| `onChange` | function | — | Called with selected value (required) |
| `searchable` | boolean | false | Show search input |
| `clearable` | boolean | false | Show clear button |
| `size` | sm\|md\|lg | md | Height: 32\|40\|48px |
| `error` | string | "" | Error message |
| `required` | boolean | false | Mark required |

---

### MantineFormFieldTextarea
**File:** `src/components/ui/form-field.tsx`

```tsx
<MantineFormFieldTextarea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={(value) => setDescription(value)}
  minRows={3}
  size="md"
  error={descError}
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | Field label (required) |
| `placeholder` | string | — | Placeholder text |
| `value` | string | — | Current value (required) |
| `onChange` | function | — | Called with value string (required) |
| `minRows` | number | 3 | Minimum visible rows |
| `size` | sm\|md\|lg | md | Padding size |
| `error` | string | "" | Error message |
| `required` | boolean | false | Mark required |

---

### MantineFormFieldMultiSelect
**File:** `src/components/ui/form-field.tsx`

```tsx
<MantineFormFieldMultiSelect
  label="Tags"
  data={[
    { value: 'tag1', label: 'Tag 1' },
    { value: 'tag2', label: 'Tag 2' }
  ]}
  value={tags}
  onChange={(values) => setTags(values)}
  searchable
  clearable
  size="md"
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `label` | string | — | Field label (required) |
| `data` | array | — | Options: `[{ value, label }, ...]` (required) |
| `value` | string[] | [] | Selected values array |
| `onChange` | function | — | Called with values array (required) |
| `searchable` | boolean | false | Show search input |
| `clearable` | boolean | false | Show clear button |
| `size` | sm\|md\|lg | md | Height: 32\|40\|48px |
| `error` | string | "" | Error message |

---

## Card Components

### Card (Base)
**File:** `src/components/ui/card.tsx`

```tsx
<Card 
  variant="elevated"
  interactive={true}
  size="md"
  className="custom-class"
>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | base\|elevated\|outlined\|filled | elevated | Visual style |
| `interactive` | boolean | false | Enable hover effects |
| `size` | sm\|md\|lg | md | Padding: 24\|32\|40px |
| `className` | string | — | Additional classes |
| `children` | ReactNode | — | Card content |

**Variant Guide:**
- `base` — Minimal styling, subtle border
- `elevated` — Shadow effect, modern look (most common)
- `outlined` — Border-based, no shadow
- `filled` — Solid background, featured content

---

### CardHeader / CardTitle / CardDescription
**File:** `src/components/ui/card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

All are presentational components with no props — just children.

---

### ClassCard (Domain-Specific)
**File:** `src/components/agenda/class-card.tsx`

```tsx
<ClassCard 
  trainingClass={classObject}
  course={courseObject}
  instructor={instructorObject}
/>
```

**Props:**
- `trainingClass` — TrainingClass object with startDate, status, time, location, modality
- `course` — Course object with title, slug
- `instructor` — Optional Instructor object with name

---

### CourseCard (Domain-Specific)
**File:** `src/components/courses/course-card.tsx`

```tsx
<CourseCard 
  course={courseObject}
  nextClass={classObject}
  compact={false}
/>
```

**Props:**
- `course` — Course object with image, title, description, durationLabel, rating, studentsCount, slug, status, featured
- `nextClass` — Optional TrainingClass object with startDate
- `compact` — boolean (sm card or md card)

**Features:**
- Hover lift animation
- Status badge
- Course metadata (duration, rating, students)
- Image zoom on hover

---

### BlogCard (Domain-Specific)
**File:** `src/components/blog/blog-card.tsx`

```tsx
<BlogCard 
  post={blogPostObject}
  featured={false}
/>
```

**Props:**
- `post` — BlogPost object with category, title, summary, date, readingTime, tags, slug
- `featured` — boolean (true = filled variant with primary color)

**Features:**
- Category badge
- Reading time + tags
- Featured variant with white text
- "Read Article" button

---

### TestimonialCard (Domain-Specific)
**File:** `src/components/common/testimonial-card.tsx`

```tsx
<TestimonialCard testimonial={testimonialObject} />
```

**Props:**
- `testimonial` — Testimonial object with name, role, organization, rating, text, course

**Features:**
- Avatar with initials
- Star rating
- Course name badge

---

## Other Components

### Button
**File:** `src/components/ui/button.tsx`

```tsx
<Button 
  variant="primary|secondary|outline|ghost"
  size="sm|md|lg"
  onClick={() => {}}
  disabled
  asChild
>
  Click me
</Button>
```

### Badge
**File:** `src/components/ui/badge.tsx`

```tsx
<Badge variant="primary|secondary|outline" size="sm|md">
  Badge text
</Badge>
```

### Avatar
**File:** `src/components/ui/avatar.tsx`

```tsx
<Avatar>
  <AvatarImage src="url" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Dialog
**File:** `src/components/ui/dialog.tsx`

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Dialog content
  </DialogContent>
</Dialog>
```

---

## Styling with Tokens

### Color Classes

```
// Primary brand
text-tk-brand, bg-tk-brand, border-tk-brand

// Secondary
text-tk-accent-strong, bg-tk-accent-soft, border-tk-accent/30

// Status colors
text-tk-success, bg-tk-success/10
text-[#7a5600], bg-[#7a5600]/10
text-tk-error, bg-tk-error/10

// Text colors
text-tk-ink       (dark text)
text-tk-ink-muted (muted text)

// Backgrounds
bg-tk-surface (white)
bg-tk-accent-soft (light tint)
```

### Spacing Classes

```
// Padding
p-2 (8px)   p-4 (16px)   p-6 (24px)   p-8 (32px)
px-4 (horizontal)        py-6 (vertical)

// Gaps
gap-2 (8px)   gap-4 (16px)   gap-6 (24px)
space-y-4 (vertical between children)

// Margin
m-4 (16px)    mt-4 (top)    mb-6 (bottom)
```

### Typography Classes

```
// Size
text-xs (12px)    text-sm (14px)    text-base (16px)
text-lg (18px)    text-2xl (24px)   text-3xl (32px)

// Weight
font-regular    font-medium    font-semibold    font-bold    font-extrabold

// Leading
leading-tight    leading-normal    leading-relaxed
```

---

## Common Compositions

### Form Container

```tsx
<form className="space-y-6">
  <MantineFormFieldText label="Name" ... />
  <MantineFormFieldSelect label="Category" ... />
  <div className="flex gap-4">
    <Button type="submit">Submit</Button>
    <Button variant="outline" type="reset">Reset</Button>
  </div>
</form>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} variant="elevated" interactive>
      <CardContent>...</CardContent>
    </Card>
  ))}
</div>
```

### Featured Section

```tsx
<Card variant="filled" interactive={false} size="lg" className="bg-tk-brand text-white">
  <CardContent className="py-12 text-center space-y-6">
    <h2>Featured Title</h2>
    <p>Description with white text</p>
  </CardContent>
</Card>
```

### Form with Error

```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<MantineFormFieldText
  label="Email"
  value={email}
  onChange={(value) => {
    setEmail(value);
    setError(value.includes('@') ? '' : 'Invalid email');
  }}
  error={error}
/>
```

---

## Quick Decision Tree

**Need to display form input?**
→ Use `MantineFormField*` (Text, Select, Textarea, MultiSelect)

**Need to organize content in a box?**
→ Use `Card` with appropriate variant

**Need a specific domain component?**
→ Check ClassCard, CourseCard, BlogCard, TestimonialCard

**Need to style something?**
→ Use token classes: `text-tk-brand`, `bg-tk-accent-soft`, `gap-6`, etc.

**Need to group multiple items?**
→ Use `grid grid-cols-*` or `flex` with `gap-*`

**Need interactive feedback?**
→ Add `interactive={true}` to Card, or use Button with onClick

---

## Component Matrix

| Component | Type | Interactive | Variants | Usage |
|-----------|------|-------------|----------|-------|
| MantineFormFieldText | Input | ✅ | sizes | Text input |
| MantineFormFieldSelect | Select | ✅ | sizes, searchable | Dropdown |
| MantineFormFieldTextarea | Textarea | ✅ | sizes, minRows | Long text |
| MantineFormFieldMultiSelect | MultiSelect | ✅ | sizes | Multiple choice |
| Card | Container | Optional | variant, size | Content box |
| ClassCard | Display | ❌ | none | Agenda item |
| CourseCard | Display | ✅ | compact | Course preview |
| BlogCard | Display | ❌ | featured | Blog article |
| TestimonialCard | Display | ❌ | none | User review |
| Button | Control | ✅ | variant, size | Action |
| Badge | Label | ❌ | variant | Status |
| Avatar | Image | ❌ | sizes | Profile pic |

---

## Size Reference

```
FormField Sizes:
  sm = 32px (height)
  md = 40px (default)
  lg = 48px

Card Sizes:
  sm = 24px (padding)
  md = 32px (default)
  lg = 40px

Button Sizes:
  sm = 32px
  md = 40px (default)
  lg = 48px

Typography Sizes:
  xs = 12px (labels)
  sm = 14px (body)
  base = 16px (default)
  lg = 18px (titles)
  2xl = 24px (heading 2)
  3xl = 32px (heading 1)
```

---

## Color Palette

```
Primary:    #004364 (Deep Blue)
Secondary:  #eef6fd (Light Blue)
Accent:     #f6be39 (Golden)
Success:    #1f6f2e (Green)
Warning:    #e67e22 (Orange)
Error:      #e74c3c (Red)
Foreground: #1a1c1e (Dark Gray)
Background: #ffffff (White)
Muted:      #50565c (Light Gray)
Border:     #d7dee5 (Light Gray)
```

---

## Performance Tips

- Use `MantineFormField*` components (pre-optimized)
- Avoid re-rendering Cards in lists (use `key={id}`)
- Use `size="sm"` for dense layouts
- Lazy load images in domain cards
- Use `interactive={false}` if card isn't clickable

---

## Testing Components

```tsx
// Form field test
<MantineFormFieldText
  label="Test"
  value=""
  onChange={() => {}}
/>

// Card test
<Card variant="elevated">
  <CardContent>Content</CardContent>
</Card>

// Domain card test
<CourseCard course={mockCourse} />
```

---

**For detailed examples, see [GETTING-STARTED.md](./GETTING-STARTED.md)**  
**For architecture, see [PATTERN-LIBRARY.md](./PATTERN-LIBRARY.md)**

*Updated: 2026-06-22*
