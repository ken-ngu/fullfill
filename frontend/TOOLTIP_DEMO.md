# Tooltip Smart Positioning Demo

## Visual Examples

### 1. Normal Position (Bottom - Preferred)

```
┌─────────────────────────────────┐
│                                 │
│  Insurance [High Impact]        │
│  ˙˙˙˙˙˙˙˙˙                     │  ← Dotted underline on hover
│  [Select: Commercial ▼]         │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Insurance Type Impact     │  │ ← Tooltip appears below
│  │                           │  │
│  │ Up to $3,995 cost diff... │  │
│  │ • Cash: $4,000/month      │  │
│  │ • Commercial: $1,092      │  │
│  │ • Medicare: $1,000        │  │
│  └──────────▲─────────────────┘  │
│            │                     │
│           Arrow                  │
│                                 │
└─────────────────────────────────┘
```

### 2. Near Bottom of Screen (Top Position)

```
┌─────────────────────────────────┐
│                                 │
│  ┌───────────────────────────┐  │
│  │ Insurance Type Impact     │  │ ← Tooltip appears above
│  │                           │  │
│  │ Up to $3,995 cost diff... │  │
│  │ • Cash: $4,000/month      │  │
│  └──────────▼─────────────────┘  │
│            │                     │
│           Arrow                  │
│                                 │
│  Insurance [High Impact]        │
│  ˙˙˙˙˙˙˙˙˙                     │
│  [Select: Commercial ▼]         │
│                                 │
└─────────────────────────────────┘
```

### 3. Near Right Edge (Left Position)

```
┌─────────────────────────────────┐
│                                 │
│  ┌────────────────┐             │
│  │ Insurance      │◄────  Plan T│ype
│  │ Type Impact    │      ˙˙˙˙˙˙│˙
│  │                │      [Selec│t▼]
│  │ Up to $3,995   │             │
│  │ cost diff...   │             │
│  └────────────────┘             │
│                                 │
└─────────────────────────────────┘
```

### 4. Near Left Edge (Right Position)

```
┌─────────────────────────────────┐
│                                 │
│         ┌────────────────┐      │
│ Insur──►│ Insurance      │      │
│ ˙˙˙˙˙   │ Type Impact    │      │
│ [Sele   │                │      │
│         │ Up to $3,995   │      │
│         │ cost diff...   │      │
│         └────────────────┘      │
│                                 │
└─────────────────────────────────┘
```

## Interaction Flow

### Desktop (Hover)
```
1. User moves mouse over label
   ├─> Dotted underline appears
   └─> No action yet

2. Mouse hovers over underlined label
   ├─> Tooltip fades in (150ms)
   ├─> Position calculated based on viewport
   └─> Arrow points to label

3. Mouse moves away
   └─> Tooltip fades out immediately
```

### Mobile (Tap)
```
1. User taps label
   ├─> Tooltip toggles on
   └─> Position calculated

2. User taps label again
   └─> Tooltip toggles off

3. User taps outside tooltip
   └─> Tooltip closes

4. User taps ESC (keyboard)
   └─> Tooltip closes
```

## Code Usage Examples

### Label Variant (Used in PatientContextBar)
```tsx
import { Tooltip } from "./components/Tooltip";

// Wrap the label text in a Tooltip with variant="label"
<label className="...">
  <Tooltip
    content={
      <div className="space-y-2">
        <p className="font-semibold">Insurance Type Impact</p>
        <p>Up to $3,995 cost difference...</p>
      </div>
    }
    variant="label"
  >
    <span className="text-slate-500">Insurance</span>
  </Tooltip>
  <span className="badge">High Impact</span>
</label>
```

**Result:** Clean label with dotted underline on hover, no visible icon.

### Icon Variant (Alternative for other use cases)
```tsx
import { Tooltip } from "./components/Tooltip";

// Use the "i" icon variant
<div className="flex items-center gap-2">
  <span>Some field</span>
  <Tooltip
    content={<p>Helpful information here</p>}
    variant="icon"
  >
    <span></span>
  </Tooltip>
</div>
```

**Result:** Small, subtle "i" icon appears next to the text.

## Smart Positioning Algorithm

```typescript
// Pseudo-code for positioning logic

function calculatePosition(trigger, tooltip, viewport) {
  const padding = 12;

  // Measure available space in all directions
  const spaceBelow = viewport.height - trigger.bottom;
  const spaceAbove = trigger.top;
  const spaceRight = viewport.width - trigger.right;
  const spaceLeft = trigger.left;

  // Priority order: bottom > top > right > left
  if (spaceBelow >= tooltip.height + padding) {
    return "bottom";  // Preferred
  } else if (spaceAbove >= tooltip.height + padding) {
    return "top";     // Second choice
  } else if (spaceRight >= tooltip.width + padding) {
    return "right";   // Third choice
  } else if (spaceLeft >= tooltip.width + padding) {
    return "left";    // Last resort
  } else {
    return "bottom";  // Default fallback
  }
}
```

### Why This Order?

1. **Bottom (Preferred)**
   - Natural reading direction (top to bottom)
   - Doesn't cover the label
   - Users expect help text to appear below

2. **Top (Second)**
   - Still maintains horizontal alignment with label
   - Good for bottom-screen elements

3. **Right (Third)**
   - Maintains vertical alignment
   - Works for left-edge elements

4. **Left (Last)**
   - Less natural reading flow
   - Only used when no other option

## Styling Details

### Label Variant
```css
/* Trigger (label wrapper) */
.relative.inline-flex.cursor-help {
  position: relative;
  display: inline-flex;
  cursor: help;
}

/* Dotted underline effect */
.border-b.border-dotted.border-slate-400 {
  border-bottom: 1px dotted rgb(148, 163, 184);
}

/* Hover state */
.hover\:border-slate-600:hover {
  border-color: rgb(71, 85, 105);
}
```

### Icon Variant
```css
/* Info icon button */
.w-3.5.h-3.5.rounded-full.bg-slate-300\/60 {
  width: 0.875rem;      /* 14px - smaller than before */
  height: 0.875rem;
  border-radius: 9999px;
  background: rgba(203, 213, 225, 0.6); /* Semi-transparent */
}

/* Hover effect */
.hover\:bg-slate-400\/80:hover {
  background: rgba(148, 163, 184, 0.8);
}
```

### Tooltip Container
```css
/* Dark theme tooltip */
.bg-slate-900.text-white.rounded-xl.shadow-2xl {
  background: rgb(15, 23, 42);
  color: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Animation */
.animate-in.fade-in.duration-150 {
  animation: fadeIn 150ms ease-in;
}
```

## Accessibility Features

### Keyboard Navigation
- Tab to focus trigger element
- Enter/Space to toggle tooltip (for icon variant)
- ESC to close tooltip
- Focus moves with keyboard navigation

### Screen Reader Support
```tsx
<button aria-label="More information">
  i
</button>
```

### Visual Indicators
- Dotted underline signals interactive element
- Color change on hover provides feedback
- High contrast tooltip for readability

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Smart positioning | ✅ | ✅ | ✅ | ✅ |
| Hover detection | ✅ | ✅ | ✅ | ✅ |
| Touch events | ✅ | ✅ | ✅ | ✅ |
| ESC key | ✅ | ✅ | ✅ | ✅ |
| Click outside | ✅ | ✅ | ✅ | ✅ |
| getBoundingClientRect | ✅ | ✅ | ✅ | ✅ |

## Performance Considerations

### Event Listeners
- Mouseenter/mouseleave for hover (desktop)
- Click for toggle (mobile)
- ESC key listener only added when tooltip is open
- Click-outside listener only added when tooltip is open
- All listeners properly cleaned up in useEffect

### Re-renders
- Position calculation only runs when tooltip becomes visible
- Uses refs to avoid unnecessary re-renders
- Tooltip content is memoized (passed as prop)

### DOM Measurements
- getBoundingClientRect called only when needed
- No layout thrashing (read all, write all pattern)
- Efficient collision detection algorithm

## Customization Options

### Content
Any React node works:
```tsx
<Tooltip content={
  <>
    <p>Bold text: <strong>Important!</strong></p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </>
}>
```

### Width
Default is 320px (w-80), can be customized:
```tsx
// In Tooltip.tsx, change:
<div className="w-80 ...">  // Change w-80 to w-96, w-64, etc.
```

### Colors
Dark theme by default, can customize:
```tsx
// Change bg-slate-900 to bg-blue-900, bg-gray-900, etc.
<div className="bg-slate-900 text-white ...">
```

### Animation
Smooth fade-in by default:
```tsx
// Adjust duration or add slide effects:
<div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
```

## Migration Guide

### From Old Tooltip
```tsx
// OLD
<label className="...">
  Field Name
  <Tooltip content={info}>
    <span></span>
  </Tooltip>
</label>

// NEW - Label Variant
<label className="...">
  <Tooltip content={info} variant="label">
    <span className="text-slate-500">Field Name</span>
  </Tooltip>
</label>

// NEW - Icon Variant (if you want to keep the icon)
<label className="...">
  Field Name
  <Tooltip content={info} variant="icon">
    <span></span>
  </Tooltip>
</label>
```

## Common Issues & Solutions

### Issue: Tooltip appears behind modal
**Solution:** Increase z-index or use React Portal to render at document root

### Issue: Tooltip flickers on hover
**Solution:** Add pointer-events-none to tooltip container (already implemented)

### Issue: Tooltip doesn't close on mobile
**Solution:** Ensure click-outside handler is working (already implemented)

### Issue: Tooltip cuts off at screen edge
**Solution:** Smart positioning should handle this automatically - verify viewport calculations

### Issue: Arrow doesn't point to trigger
**Solution:** Check arrow positioning styles for each direction (already implemented)
