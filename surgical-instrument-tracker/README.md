# Assemble Tray Prototype

An AI-powered surgical instrument tracking dashboard simulation. The app simulates an instrument-detection workflow with three linked panels: a **Camera View** (detection input), a **Live View** (active detections), and a **Count Sheet** (instrument inventory).

## Features

### Camera View
- Blue "sterile mat" — click anywhere to simulate a detection inference
- Bounding boxes are drawn over detections with a rank number and confidence label
- Color-coded boxes: **green** (correct), **amber** (uncertain), **red** (incorrect)
- Right-click a green box to remove it (counts it into the Count Sheet)

### Live View
- Grid of square cards, two rows always visible
- New detections appear with a sequential rank; removing an item re-sequences the remaining ranks
- Amber "uncertain" cards expose **Confirm** (promote to correct) and **Remove** buttons
- Cards animate with Framer Motion when items are added or removed

### Count Sheet
- Increment/decrement controls per instrument showing `current / required`
- Rows for instruments currently detected are highlighted at the top, ordered by rank (correct first, then uncertain)
- Fully counted rows are greyed out and sink to the bottom in their original order
- Progress bar summarises total completion

### Detection logic ("inference manager")
- **Confidence filter:** detections below 65% confidence are ignored
- **Status assignment:**
  - Not in the count sheet → `incorrect` (red)
  - In the count sheet, confidence ≥ 85% → `correct` (green)
  - In the count sheet, confidence 65–85% → `uncertain` (amber; must be confirmed)
- **Overlap matching:** a new detection overlapping an existing box by >90% refreshes it instead of adding a duplicate
- **Rank ordering:** ranks are sequential; removals re-sequence so numbering stays gapless

### Access
- The app is gated by a password screen. The demo password is set in `src/components/PasswordGate.tsx` (`ACCESS_PASSWORD` constant).

## Tech Stack

- [Vite](https://vitejs.dev/) 5
- [React](https://react.dev/) 18 with TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 3 with a semantic token-based theme
- [shadcn/ui](https://ui.shadcn.com/) component library (Radix UI primitives)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React Router](https://reactrouter.com/) 6
- [Vitest](https://vitest.dev/) + React Testing Library

## Getting Started

```sh
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at http://localhost:8080.

### Other scripts

```sh
npm run build        # production build (outputs to dist/)
npm run preview      # serve the production build locally
npm run lint         # run ESLint
npm run test         # run unit tests
```

## Project Structure

```
├── index.html                  # App shell
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Routes
│   ├── index.css               # Design tokens (colors, spacing) + base styles
│   ├── components/
│   │   ├── PasswordGate.tsx    # Password-protected access screen
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── surgical/           # App feature panels
│   │       ├── SurgicalDashboard.tsx  # Layout + state wiring
│   │       ├── CameraView.tsx         # Mat + bounding boxes
│   │       ├── LiveView.tsx           # Detection cards grid
│   │       ├── CountSheet.tsx         # Instrument inventory
│   │       └── ControlPanel.tsx       # Sidebar controls
│   ├── hooks/
│   │   └── useInstrumentTracking.ts   # Detection / ranking / counting logic
│   ├── types/
│   │   └── surgical.ts         # Shared type definitions
│   └── pages/
│       └── Index.tsx           # Home route
├── tailwind.config.ts          # Theme extension
└── vite.config.ts              # Build config (@ path alias)
```

## Customising

- **Instruments:** edit `INITIAL_COUNT_SHEET` and `INSTRUMENT_NAMES` in `src/hooks/useInstrumentTracking.ts`
- **Confidence thresholds:** `CONFIDENCE_HIGH_THRESHOLD` / `CONFIDENCE_LOW_THRESHOLD` in the same file
- **Colors:** all colors are HSL tokens in `src/index.css` (`--success`, `--warning`, `--error`, `--primary`, …) — components reference semantic classes like `text-success`, never raw hex values
- **Password:** `ACCESS_PASSWORD` in `src/components/PasswordGate.tsx`

> **Note:** the password gate is a client-side demo control, not real security. Wire it to proper authentication before deploying anywhere sensitive.
