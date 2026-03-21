# UI Components

Premium, reusable UI components built with TypeScript and TailwindCSS. No external component libraries.

## Installation

All components are ready to use. Import them from `@/components/ui`:

```tsx
import { Button, Input, Badge } from '@/components/ui';
```

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean

### Badge

Small status indicators and labels.

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'secondary'
- `size`: 'sm' | 'md'

### Avatar

User avatars with initials fallback and status indicators.

```tsx
<Avatar name="John Doe" size="md" showStatus statusType="online" />
<Avatar src="/path/to/image.jpg" name="Jane Smith" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `name`: string (for initials)
- `src`: string (image URL)
- `showStatus`: boolean
- `statusType`: 'online' | 'offline' | 'away'

### Input

Text input with label, error, and helper text support.

```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  helperText="We'll never share your email"
  fullWidth
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean

### Textarea

Multi-line text input.

```tsx
<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
  fullWidth
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean

### Select

Dropdown select component.

```tsx
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  fullWidth
/>
```

**Props:**
- `label`: string
- `options`: Array<{ value: string; label: string }>
- `error`: string
- `helperText`: string
- `fullWidth`: boolean

### Checkbox

Checkbox with custom styling.

```tsx
<Checkbox
  label="Accept terms"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

**Props:**
- `label`: string
- `error`: string

### RadioGroup

Radio button group component.

```tsx
<RadioGroup
  label="Select option"
  name="choice"
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ]}
  orientation="vertical"
/>
```

**Props:**
- `label`: string
- `options`: Array<{ value: string; label: string; disabled?: boolean }>
- `orientation`: 'vertical' | 'horizontal'
- `error`: string

### DatePicker

Date input with calendar icon.

```tsx
<DatePicker
  label="Start Date"
  fullWidth
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean

### FileUpload

Drag-and-drop file upload component.

```tsx
<FileUpload
  label="Upload Documents"
  acceptedFormats={['.pdf', '.doc']}
  maxSize={10 * 1024 * 1024}
  multiple
  onChange={(files) => console.log(files)}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `acceptedFormats`: string[]
- `maxSize`: number (in bytes)
- `onChange`: (files: FileList | null) => void

### Tooltip

Hoverable tooltip with positioning.

```tsx
<Tooltip content="This is helpful info" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right'
- `delay`: number (milliseconds)

### ProgressBar

Progress indicator with variants.

```tsx
<ProgressBar
  value={75}
  max={100}
  variant="success"
  showLabel
  label="Upload Progress"
/>
```

**Props:**
- `value`: number
- `max`: number (default: 100)
- `variant`: 'default' | 'success' | 'warning' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `showLabel`: boolean
- `label`: string

## Theme Integration

All components automatically adapt to light/dark themes using the theme system. They use these color tokens:

- `bg` - Background
- `surface` - Cards/containers
- `elevated` - Elevated elements
- `border` - Borders
- `primary` - Primary text
- `secondary` - Secondary text
- `muted` - Muted text
- `brand` - Brand color
- `success` - Success states
- `warning` - Warning states
- `danger` - Error states

## Showcase

View all components in action at `/components-showcase`
