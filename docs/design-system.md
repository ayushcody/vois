# Design System

EkMat uses a custom design system built with CSS variables to ensure consistency across the application.

## Color Palette

| Color Name   | Hex Code  | Usage |
| :--- | :--- | :--- |
| **Primary** | `#4F46E5` | Main actions, buttons, active states (Indigo) |
| **Primary Dark** | `#3730A3` | Hover states, headers |
| **Secondary** | `#10B981` | Success states, innovative features (Emerald) |
| **Accent** | `#F59E0B` | Warnings, highlights (Amber) |
| **Background** | `#F3F4F6` | App background (Cool Gray) |
| **Surface** | `#FFFFFF` | Cards, modals, navbar |
| **Text Primary** | `#111827` | Headings, body text |
| **Text Secondary** | `#6B7280` | Subtitles, captions |
| **Error** | `#EF4444` | Error messages, destructive actions |

## Typography

Font Family: **'Inter', system-ui, sans-serif**

| Scale | Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| **H1** | `2.5rem` | 700 | Page Titles, Hero Text |
| **H2** | `2rem` | 600 | Section Headers |
| **H3** | `1.5rem` | 600 | Card Titles |
| **Body** | `1rem` | 400 | Standard text |
| **Small** | `0.875rem` | 400 | Hints, metadata |

## Components

### Button
Standard interactive element.
-   **Variants**: `primary`, `secondary`, `outline`, `ghost`
-   **Sizes**: `sm`, `md`, `lg`
-   **Example**: `<Button variant="primary">Vote Now</Button>`

### Card
Container for content with shadow and rounded corners.
-   **Usage**: Candidate profiles, stats, forms.
-   **Props**: `header` (optional), `footer` (optional).
-   **Example**: `<Card><p>Content</p></Card>`

### Stepper
Visual progress indicator for multi-step flows (e.g., Registration).
-   **Props**: `steps` (string[]), `currentStep` (number).

### Toast
Global notification system.
-   **Types**: `success`, `error`, `info`, `warning`.
-   **Hook**: `useToast()` -> `showToast(message, type)`.

## Spacing & Layout

-   **Container**: Max-width `1200px` centered.
-   **Spacing Scale**: Multiples of `4px` (0.25rem).
    -   `sm`: 0.5rem (8px)
    -   `md`: 1rem (16px)
    -   `lg`: 2rem (32px)
    -   `xl`: 4rem (64px)
-   **Border Radius**:
    -   `sm`: 4px
    -   `md`: 8px
    -   `lg`: 16px
