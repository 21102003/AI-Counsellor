## Project Summary
A high-conversion SaaS platform for "AI Counsellor," a specialized tool for students aiming for top-tier study abroad admissions. The design follows a "Deep Space Intelligence" (Deep Obsidian) aesthetic with high-end motion and glassmorphism.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4 with typography and animate plugins
- **Animation:** Framer Motion (Mandatory for layout and interactions)
- **Icons:** Lucide React
- **Components:** Shadcn/UI (Heavily customized)
- **Utilities:** Date-fns for deadline calculations

## Architecture
- `src/app/page.tsx`: Landing page with high-conversion patterns
- `src/app/discovery/page.tsx`: University discovery protocol with marketplace grid
- `src/app/applications/page.tsx`: Application mission roadmap with intelligent timeline
- `src/components/`: Reusable glassmorphic UI components
- `src/lib/`: Utility functions and shared logic

## User Preferences
- **Theme:** "Void & Neon" (`bg-[#030712]`)
- **Visual Style:** Glassmorphism 2.0, Spotlights, Metallic Gradients
- **Typography:** Geist Sans for UI, Geist Mono for financial/stat data
- **Animations:** LayoutGroup for reshuffling, SVG path animations for timelines, scale interactions on hover

## Project Guidelines
- No comments unless requested
- Use relative URLs for client-side API calls
- Use "Execution Protocol" instead of "To-Do List" and "Verified" instead of "Done"
- Maintain "Deep Obsidian" aesthetic consistency: `bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl`

## Common Patterns
- **Framer Motion:** Staggered fade-ins, magnetic buttons, liquid progress bars
- **Glassmorphism:** `backdrop-blur-xl` with thin white borders
- **Typography:** `tracking-tight` headings, `text-slate-400` body
- **Color Accents:** `emerald-400` (Success), `amber-400` (Pending), `indigo-500` (AI/Action)
