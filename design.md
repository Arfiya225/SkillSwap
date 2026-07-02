# SkillSwap AI - Design Specification

## 1. Introduction

This design specification defines the visual language, interaction patterns, and UI structure for SkillSwap AI. It is intended to guide implementation of a modern, colorful, glassmorphic web experience with smooth animations, rich data visualization, and a polished user journey.

---

## 2. Design Goals

- Create a premium peer learning platform with an intuitive, vibrant, and modern interface.
- Use glassmorphism and soft gradients to convey trust, clarity, and high tech appeal.
- Prioritize usability across desktop and mobile.
- Surface AI-driven insights with engaging dashboards, graphs, and cards.
- Support fast onboarding, discovery, and collaboration.

---

## 3. Brand & Visual Identity

### 3.1 Color Palette

Primary colors:
- `#3B82F6` (Azure Blue) - trust, intelligence.
- `#9D7CFC` (Lavender Violet) - creativity, technology.
- `#22C55E` (Spring Green) - growth, success.
- `#F472B6` (Coral Pink) - friendly accent.

Neutrals:
- `#0F172A` - dark background.
- `#111827` - deep panel surfaces.
- `#E2E8F0` - light text and borders.
- `#F8FAFC` - soft highlights.

Glassmorphism surfaces:
- `rgba(255, 255, 255, 0.14)`
- `rgba(255, 255, 255, 0.08)`
- `rgba(15, 23, 42, 0.64)`

### 3.2 Typography

Primary font:
- `Inter` or `Plus Jakarta Sans` for digital clarity.

Type scale:
- Display: 52px / 48px
- Heading 1: 36px
- Heading 2: 28px
- Heading 3: 22px
- Body: 16px
- Caption: 13px

Weight range:
- Regular 400
- Medium 500
- Semibold 600
- Bold 700

### 3.3 Iconography

- Use crisp line icons with light stroke weight.
- Provide filled and outline variants for states.
- Prefer consistent rounded corners and modern geometry.
- Common icons: profile, chat, rocket, star, shield, graph, calendar, meeting.

---

## 4. UI Patterns

### 4.1 Layout and Structure

- Use a fixed top navigation with logo, search, quick actions, and profile.
- Implement an adaptive two-column dashboard for desktop; single-column for mobile.
- Use generous spacing, soft rounded containers, and glassmorphism backgrounds.
- Group content into cards and sections to reduce cognitive load.

### 4.2 Navigation

Primary navigation items:
- Home / Dashboard
- Skill Match
- Learning Rooms
- Marketplace
- Sessions
- Analytics
- Profile

Secondary navigation:
- Notifications
- Messages
- Quick create (swap request, room, session)

### 4.3 Cards & Panels

- Use translucent panels with subtle blur and inner glow.
- Add soft gradient borders or shadow for depth.
- Present key metrics in small summary cards with icon group and progress rings.

### 4.4 Forms & Inputs

- Floating labels with animated focus states.
- Rounded input fields with glass backgrounds and subtle border highlight.
- Clear validation messaging with colored badges.

### 4.5 Buttons

Primary action:
- Solid gradient fill, white text, subtle elevation.

Secondary action:
- Semi-transparent glass background with colored border.

Tertiary action:
- Text-only with hover underline or glow.

### 4.6 Data Visualization

- Use cards with line charts, donut charts, bar charts, and radial progress.
- Animate charts on page load and when data updates.
- Provide mini-stat snapshots for active swaps, hours, streaks, verification rate.

### 4.7 Motion & Animation

- Micro-interactions for hover, focus, and active states.
- Smooth transitions for page sections and panels.
- Use parallax overlay pulses and animated gradients on hero sections.
- Animate list items when they appear or reorder.
- Use subtle loading shimmer for data cards.

---

## 5. Page Designs

### 5.1 Landing / Dashboard

Sections:
- Hero section with headline, subtext, CTA buttons, and floating skill bubbles.
- Match summary with AI recommendation cards and trust score.
- Active swap progress strip with participants, meeting countdown, and status chips.
- Analytics panel showing learning hours, streak, request activity, top skills.
- Recent activity feed for notifications, ratings, and session summaries.

Visual style:
- Full-screen gradient hero with glass panels layered over a blurred background.
- Animated floating skill tags and soft glow edges.
- Use chart cards with radial progress and stacked bars.

### 5.2 Skill Match

Sections:
- Filter toolbar with skill, level, availability, and suggested partner toggles.
- Match cards showing user profile, offer/need overlap, match percentage, and action buttons.
- AI explanation panel with bullet insights and recommended next steps.
- Graphical match distribution visible as a network cluster or radial chart.

Interaction:
- Cards expand on hover to show quick preview.
- Clicking a card opens detailed partner profile or request flow.
- Use colored badges to highlight strong skill matches.

### 5.3 Learning Rooms

Sections:
- Room overview header with session stats, participant count, and join button.
- Shared notes area with rich text editing placeholder.
- Resource gallery with uploads, links, and attachments.
- Tasks board with cards, assignees, due dates, and completion progress.
- AI summary widget showing latest session notes and action items.

Style:
- Use stacked glass panels, timeline lines, and accent gradients.
- Provide micro-animations when tasks complete or resources are added.

### 5.4 Swap Request System

Sections:
- Request creation form with skill exchange details, preferred schedule, and notes.
- Request list grouped by status: pending, accepted, active, completed, rejected.
- Each request card shows user info, skills offered/needed, status pill, and quick actions.
- Notifications and reminders panel.

UX:
- Add smooth filter tabs and loading skeletons.
- Use status color system: blue for pending, green for accepted, purple for active, gray for completed, red for rejected.

### 5.5 Marketplace

Sections:
- Marketplace hero with search bar and featured exchanges.
- Listing grid showing cards with skill offer, target skill, user rating, and apply button.
- Filters for categories, experience level, availability, and verification badge.
- Featured listing carousel with animations.

Design:
- Use bright gradient tags for skill categories.
- Cards animate on hover with scale and shadow.

### 5.6 AI Features

Sections:
- AI Study Path builder form with current skill, target skill, hours/week, and goal type.
- Result area with timeline roadmap, milestones, resources, and action cards.
- AI assistant chat interface for questions, explanation, and note generation.
- Session summary generator with summary, action items, and next goals.

Visual treatment:
- Use conversational chat bubbles with accent highlights.
- Present AI outputs inside glass cards with animated callouts.

### 5.7 Admin Dashboard

Sections:
- KPI row with total users, active swaps, verified users, marketplace listings.
- Table of user management actions with search and filters.
- Verification queue panel with certificate review cards.
- Analytics chart area for weekly activity and adoption trends.

Design:
- Use professional data dashboards with gradient chart backgrounds.
- Provide quick action pills for approve/reject operations.

---

## 6. Component Library

### 6.1 Core Components

- App shell: navigation, sidebar, responsive page container.
- GlassCard: translucent panel with blur, border, shadow.
- MetricCard: small KPI display with icon, value, label.
- ActionButton: primary/secondary/tertiary button styles.
- InputField: labeled input with animated focus.
- Badge: status and category chips.
- Avatar: user avatar with status ring.
- Modal: centered overlay with glass style.
- Tabs: segmented controls with active indicator.
- Table: responsive data table with zebra rows and sticky headers.
- Skeleton Loader: shimmer for data placeholders.

### 6.2 Visual Components

- ProgressRing: animated radial progress visual.
- SkillChip: rounded tag with gradient or ghost state.
- DataCard: chart container with title and metrics.
- TimelineStep: numbered milestone or progress step.
- NotificationToast: slide-in message with icon.
- Tooltip: subtle overlay for helper text.

### 6.3 Interaction Patterns

- Hover elevation for cards and buttons.
- Focus ring for keyboard navigation.
- Press state feedback with scaling.
- Animated page transitions for route changes.
- Drag handle style for task cards.

---

## 7. Interaction & Animation Guidelines

- Use 150-250ms easing animations for hover and state changes.
- Use 300-500ms transitions for modal open/close and page section reveals.
- Animate opacity, transform, and backdrop blur for entrance effects.
- Stagger appearance of list items and chart overlays.
- Keep motion subtle and optional for accessibility.

Example interactions:
- Button hover: slight upward translate and glow.
- Card reveal: fade + slide from bottom.
- Menu open: scale + fade.
- Loading shimmer: moving gradient.

---

## 8. Data Visualization & Analytics

### 8.1 Dashboard Graphs

- Active swap trend: line chart across days/weeks.
- Learning hours: stacked bar chart by week.
- Skill match distribution: radial bubble chart or donut.
- Participation ratio: segmented progress bar.
- Request lifecycle: horizontal status flow chart.

### 8.2 Chart Styling

- Use gradient strokes and soft glows.
- Minimal axis lines with light opacity.
- Highlight current data points with accent markers.
- Use tooltips on hover with concise numbers.

### 8.3 Infographics

- Use illustrated cards for AI recommendations.
- Display verification level as shield progress.
- Use progress steps for study plan milestones.

---

## 9. Responsive & Adaptive Design

- Mobile layout collapses sidebar into bottom nav or hamburger menu.
- Use full-width stacked cards on mobile.
- Maintain touch-friendly spacing and button sizes.
- Keep charts and boards scrollable with horizontal overflow when needed.
- Preserve glassmorphism and gradients across breakpoints.

Breakpoint examples:
- Desktop: 1440px+
- Tablet: 768px–1439px
- Mobile: <768px

---

## 10. Accessibility

- Ensure contrast ratios meet WCAG AA.
- Support keyboard navigation for all interactive elements.
- Provide accessible labels and aria attributes.
- Avoid motion that can cause discomfort; add reduced-motion support.
- Use semantic HTML structure in implementation.

---

## 11. Design System Tokens

### Spacing

- xs: 8px
- sm: 12px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Border radius

- Small: 12px
- Medium: 20px
- Large: 32px

### Elevation

- Soft shadow: `0 12px 34px rgba(15, 23, 42, 0.14)`
- Glass glow: `0 0 0 1px rgba(255,255,255,0.08)`

---

## 12. UI Flow and Key Screens

### Authentication Flow

- Welcome screen
- Email/Google login
- Signup with profile setup
- Email verification prompt

### Onboarding

- Profile creation wizard
- Skill offer / skill need selection
- Personal goals and availability
- Quick match preview

### Core Experience

- Dashboard overview
- Match discovery
- Swap request creation
- Learning room collaboration
- AI assistant and summaries

### Admin Experience

- Overview dashboard
- User & verification management
- Analytics and moderation tools

---

## 13. Conceptual UI Examples

### Hero section

- A dark glassmorphic panel over a blurred gradient background.
- Animated skill bubbles and AI assistant badge.
- Primary CTA: "Find Your Learning Partner".
- Secondary CTA: "Explore Marketplace".

### Match tiles

- Glass card with profile avatar, match score, offered/needed skills.
- Visual overlap indicator with colored arcs.
- Animated indicator for AI confidence and recent activity.

### Learning room header

- Participant avatars arranged in a floating ring.
- Session status pill and next meeting countdown.
- Quick actions for join, note, and session summary.

---

## 14. Implementation Notes

- Use Tailwind CSS utility classes or a component library supporting glassmorphism.
- Prefer components that support motion and theming.
- Keep visuals consistent across desktop and mobile.
- Use SVGs for custom graph decorations and animated icons.
- Store design tokens in a shared theme file for colors, shadows, spacing.

---

## 15. Handoff Checklist

- Page structure and component hierarchy
- Color palette with hex values
- Typography scale and weights
- Interaction/animation rules
- Chart types and data visualization guidelines
- Responsive breakpoints and layout rules
- Accessibility requirements
- UI states for cards, buttons, and forms

---

## 16. Summary

SkillSwap AI should feel modern, energetic, and trustworthy. The design combines glassmorphism, animated interactions, color-rich gradients, and clean data visualizations to support peer learning, AI-driven guidance, and engaging collaboration. Keep the user journey simple and the interface expressive to make learning exchanges feel exciting and polished.
