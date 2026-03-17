<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>
## 2026-03-12 (latest)
- Slider values in ChannelRow and MetricSlider now click-to-edit with inline number input
- Added CmykRgbEditor component showing editable CMYK+RGB fields under each recipe card
- Reset button turns dark red (#991b1b) on hover using inline onMouseEnter/Leave state
- Signal Parameters card moved into right column below Patch card (no longer full-width)

## 2026-03-12
- File & Get Inks header buttons made wider (flex-[2]), Quit narrower (flex-[1])
- Top toggles row centered with justify-center
- White button made wider (flex-[2]), Reset button narrower (flex-[1])

## 2026-03-12
- Moved Patch/Rotate toggle buttons from Patch card header to body, below Y Pos slider
- Buttons now render as full-width row with orange active styling, matching ToggleChip aesthetics

## 2026-03-12
- Placed Patch Settings in a right-side column (w-48) beside the Input/Gamma recipes
- Widened max container from max-w-xl to max-w-3xl to accommodate side-by-side layout
- Centered everything; Signal Parameters remains full-width below the two-column area

## 2026-03-12
- Added gradient frame border to Input, Output, Gamma SectionCards driven by live `frameColor` prop
- Frame uses 1.5px gradient wrapper: `color@60% → color@20% → transparent`, updates live with CMYK sliders

## 2026-03-12
- Converted Ink 0–5 tabs into independent pages, each with its own full state (InkPageState type)
- Extracted all per-ink content (Input/Output/Gamma recipes, Patch, Signal) into `InkPage` component
- 6 pages stored in `inkPages` array; `updateInkPage(index, patch)` handles partial state updates
- Reset button on each page resets only that ink's page to `defaultInkPage()` defaults

## 2026-03-12
- Removed ColorFrame solid color bars above each color picker in Input, Output, Gamma sections
- Previously replaced gradient frames with solid color frames in all 3 recipe sections
- Removed logo/title from header; stretched File+GetInks+Quit buttons to full-width row
- Updated Coloring dropdown options: None, CT, Shade, Weight, Ink in White, CT Shade & Weight, trapped Inks ONLY

## 2026-03-12
- Converted full UI to light mode in `src/screens/Screenshot/Screenshot.tsx` and `tailwind.css`
- Added color picker swatches to Input, Output, Gamma recipe sections (bidirectional CMYK ↔ hex sync)
- Added gradient frame bar in each recipe section reflecting picked color
- Removed all neon glows/dark backgrounds; switched to white cards, gray-50 page bg, soft shadows
</changelog>
