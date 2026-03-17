import { useState, useRef } from "react";

/* ─── Helpers ────────────────────────────────────────────── */
function cmykToRgb(c: number, m: number, y: number, k: number) {
  const r = Math.round(255 * (1 - c / 255) * (1 - k / 255));
  const g = Math.round(255 * (1 - m / 255) * (1 - k / 255));
  const b_ = Math.round(255 * (1 - y / 255) * (1 - k / 255));
  return { r, g, b: b_, hex: `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b_.toString(16).padStart(2,"0")}`, css: `rgb(${r},${g},${b_})` };
}

function hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 255 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return {
    c: Math.round(c * 255),
    m: Math.round(m * 255),
    y: Math.round(y * 255),
    k: Math.round(k * 255),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

/* ─── Light Slider ───────────────────────────────────────── */
const ModernSlider = ({
  value,
  onChange,
  min = 0,
  max = 255,
  accentColor = "#6366f1",
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  accentColor?: string;
  step?: number;
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative w-full flex items-center" style={{ height: 20 }}>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gray-200" />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
        style={{ width: `${pct}%`, background: accentColor, opacity: 0.7 }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-white shadow-sm"
        style={{ left: `calc(${pct}% - 7px)`, borderColor: accentColor, zIndex: 1 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ zIndex: 2 }}
      />
    </div>
  );
};

/* ─── Editable Channel Row ───────────────────────────────── */
const ChannelRow = ({
  label,
  value,
  onChange,
  accentColor,
  max = 255,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
  max?: number;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onChange(Math.max(0, Math.min(max, Math.round(parsed))));
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-bold w-4 text-center flex-shrink-0" style={{ color: accentColor }}>
        {label}
      </span>
      <div className="flex-1">
        <ModernSlider value={value} onChange={onChange} max={max} accentColor={accentColor} />
      </div>
      {editing ? (
        <input
          autoFocus
          type="number"
          min={0}
          max={max}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
          className="text-xs font-mono w-10 text-right flex-shrink-0 rounded border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 px-1 py-0"
          style={{ color: accentColor, background: "#f0f4ff" }}
        />
      ) : (
        <span
          className="text-xs font-mono w-10 text-right flex-shrink-0 cursor-text rounded px-1 hover:bg-gray-100 transition-colors"
          style={{ color: accentColor }}
          onClick={startEdit}
          title="Click to edit"
        >
          {value}
        </span>
      )}
    </div>
  );
};

/* ─── Toggle Chip ────────────────────────────────────────── */
const ToggleChip = ({
  label,
  active,
  onChange,
  accent = "#6366f1",
}: {
  label: string;
  active: boolean;
  onChange: () => void;
  accent?: string;
}) => (
  <button
    onClick={onChange}
    className="rounded-md px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 border"
    style={{
      borderColor: active ? accent : "#d1d5db",
      color: active ? accent : "#9ca3af",
      background: active ? `${accent}15` : "transparent",
    }}
  >
    {label}
  </button>
);

/* ─── Color Picker Swatch ────────────────────────────────── */
const ColorPickerSwatch = ({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (hex: string) => void;
  label: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2 mb-1">
      <div
        className="relative w-8 h-8 rounded-lg cursor-pointer border-2 border-white shadow-md flex-shrink-0 overflow-hidden"
        onClick={() => inputRef.current?.click()}
        style={{ background: color }}
      >
        <input
          ref={inputRef}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <div>
        <div className="text-[10px] text-gray-400 font-medium leading-none mb-0.5">{label}</div>
        <div className="text-xs font-mono text-gray-600 leading-none">{color.toUpperCase()}</div>
      </div>
    </div>
  );
};

/* ─── CMYK + RGB Editable Fields ─────────────────────────── */
type CmykValues = { c: number; m: number; y: number; k: number };

const CmykRgbEditor = ({
  c, m, y, k,
  maxVal = 255,
  onChange,
}: {
  c: number; m: number; y: number; k: number;
  maxVal?: number;
  onChange: (vals: Partial<CmykValues>) => void;
}) => {
  const rgb = cmykToRgb(
    Math.round((c / maxVal) * 255),
    Math.round((m / maxVal) * 255),
    Math.round((y / maxVal) * 255),
    Math.round((k / maxVal) * 255)
  );

  const [rgbDraft, setRgbDraft] = useState({ r: "", g: "", b: "" });
  const [editingRgb, setEditingRgb] = useState<"r"|"g"|"b"|null>(null);
  const [cmykDraft, setCmykDraft] = useState({ c: "", m: "", y: "", k: "" });
  const [editingCmyk, setEditingCmyk] = useState<"c"|"m"|"y"|"k"|null>(null);

  const commitRgb = (channel: "r"|"g"|"b", val: string) => {
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      const newR = channel === "r" ? Math.max(0, Math.min(255, parsed)) : rgb.r;
      const newG = channel === "g" ? Math.max(0, Math.min(255, parsed)) : rgb.g;
      const newB = channel === "b" ? Math.max(0, Math.min(255, parsed)) : rgb.b;
      const converted = hexToCmyk(rgbToHex(newR, newG, newB));
      onChange({
        c: Math.round((converted.c / 255) * maxVal),
        m: Math.round((converted.m / 255) * maxVal),
        y: Math.round((converted.y / 255) * maxVal),
        k: Math.round((converted.k / 255) * maxVal),
      });
    }
    setEditingRgb(null);
  };

  const commitCmyk = (channel: "c"|"m"|"y"|"k", val: string) => {
    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      onChange({ [channel]: Math.max(0, Math.min(maxVal, parsed)) });
    }
    setEditingCmyk(null);
  };

  const fieldCls = "w-8 text-center text-[10px] font-mono rounded border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 bg-gray-50 px-0.5 py-0.5";
  const labelCls = "text-[9px] font-bold text-center leading-none mb-0.5";

  return (
    <div className="flex gap-3 items-start py-1 border-t border-gray-100 mt-1">
      {/* CMYK */}
      <div>
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">CMYK</div>
        <div className="flex gap-1.5">
          {(["c","m","y","k"] as const).map((ch) => {
            const colors: Record<string, string> = { c:"#06b6d4", m:"#d946ef", y:"#ca8a04", k:"#64748b" };
            const vals: Record<string, number> = { c, m, y, k };
            return (
              <div key={ch} className="flex flex-col items-center">
                <div className={labelCls} style={{ color: colors[ch] }}>{ch.toUpperCase()}</div>
                {editingCmyk === ch ? (
                  <input
                    autoFocus
                    type="number"
                    min={0}
                    max={maxVal}
                    value={cmykDraft[ch]}
                    onChange={(e) => setCmykDraft((d) => ({ ...d, [ch]: e.target.value }))}
                    onBlur={() => commitCmyk(ch, cmykDraft[ch])}
                    onKeyDown={(e) => { if (e.key === "Enter") commitCmyk(ch, cmykDraft[ch]); if (e.key === "Escape") setEditingCmyk(null); }}
                    className={fieldCls}
                    style={{ width: 30, color: colors[ch] }}
                  />
                ) : (
                  <span
                    className={fieldCls + " cursor-text hover:border-indigo-300"}
                    style={{ display:"block", width: 30, color: colors[ch] }}
                    onClick={() => { setCmykDraft((d) => ({ ...d, [ch]: String(vals[ch]) })); setEditingCmyk(ch); }}
                  >
                    {vals[ch]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* divider */}
      <div className="w-px bg-gray-200 self-stretch mt-4" />
      {/* RGB */}
      <div>
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">RGB</div>
        <div className="flex gap-1.5">
          {(["r","g","b"] as const).map((ch) => {
            const colors: Record<string, string> = { r:"#ef4444", g:"#22c55e", b:"#3b82f6" };
            const vals: Record<string, number> = { r: rgb.r, g: rgb.g, b: rgb.b };
            return (
              <div key={ch} className="flex flex-col items-center">
                <div className={labelCls} style={{ color: colors[ch] }}>{ch.toUpperCase()}</div>
                {editingRgb === ch ? (
                  <input
                    autoFocus
                    type="number"
                    min={0}
                    max={255}
                    value={rgbDraft[ch]}
                    onChange={(e) => setRgbDraft((d) => ({ ...d, [ch]: e.target.value }))}
                    onBlur={() => commitRgb(ch, rgbDraft[ch])}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRgb(ch, rgbDraft[ch]); if (e.key === "Escape") setEditingRgb(null); }}
                    className={fieldCls}
                    style={{ width: 30, color: colors[ch] }}
                  />
                ) : (
                  <span
                    className={fieldCls + " cursor-text hover:border-indigo-300"}
                    style={{ display:"block", width: 30, color: colors[ch] }}
                    onClick={() => { setRgbDraft((d) => ({ ...d, [ch]: String(vals[ch]) })); setEditingRgb(ch); }}
                  >
                    {vals[ch]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── Section Card ───────────────────────────────────────── */
const SectionCard = ({
  title,
  children,
  locked,
  onLockToggle,
  active,
  onActiveToggle,
  solidOnly,
  onSolidOnlyToggle,
  showControls = false,
  accent = "#6366f1",
  frameColor,
}: {
  title: string;
  children: React.ReactNode;
  locked?: boolean;
  onLockToggle?: () => void;
  active?: boolean;
  onActiveToggle?: () => void;
  solidOnly?: boolean;
  onSolidOnlyToggle?: () => void;
  showControls?: boolean;
  accent?: string;
  frameColor?: string;
}) => (
  <div
    className="rounded-xl mb-3 shadow-sm p-[1.5px]"
    style={{
      background: frameColor
        ? `linear-gradient(135deg, ${frameColor}99 0%, ${frameColor}33 40%, transparent 70%)`
        : "#e5e7eb",
    }}
  >
    <div className="rounded-[10px] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: accent }}>
          {title}
        </span>
        {showControls && (
          <div className="flex items-center gap-2">
            {onActiveToggle && (
              <ToggleChip label="Active" active={!!active} onChange={onActiveToggle} accent={accent} />
            )}
            {onSolidOnlyToggle && (
              <ToggleChip label="Solid Only" active={!!solidOnly} onChange={onSolidOnlyToggle} accent={accent} />
            )}
            {onLockToggle && (
              <ToggleChip label="Lock" active={!!locked} onChange={onLockToggle} accent="#f59e0b" />
            )}
          </div>
        )}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2.5">{children}</div>
    </div>
  </div>
);

/* ─── Compact Metric Slider (with editable number) ───────── */
const MetricSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onChange(Math.max(min, Math.min(max, parsed)));
    setEditing(false);
  };

  const display = Number.isInteger(value) ? String(value) : value.toFixed(2);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">{label}</span>
        {editing ? (
          <input
            autoFocus
            type="number"
            min={min}
            max={max}
            step={step}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            className="text-[10px] font-mono w-14 text-right rounded border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-400 px-1 py-0 bg-indigo-50"
            style={{ color: "#818cf8" }}
          />
        ) : (
          <span
            className="text-[10px] font-mono cursor-text rounded px-1 hover:bg-gray-100 transition-colors"
            style={{ color: "#818cf8" }}
            onClick={() => { setDraft(display); setEditing(true); }}
            title="Click to edit"
          >
            {display}{unit}
          </span>
        )}
      </div>
      <ModernSlider value={value} onChange={onChange} min={min} max={max} step={step} accentColor="#818cf8" />
    </div>
  );
};

/* ─── Per-Ink Page State Type ────────────────────────────── */
type InkPageState = {
  /* Input Recipe */
  inputActive: boolean;
  inputSolidOnly: boolean;
  inputC: number;
  inputM: number;
  inputY: number;
  inputK: number;
  inputLock: boolean;
  /* Gamma Recipe */
  gammaCommon: number;
  gammaC: number;
  gammaM: number;
  gammaY: number;
  gammaK: number;
  gammaLock: boolean;
  /* Patch Settings */
  patch: boolean;
  rotate: boolean;
  spaceMm: number;
  widthMm: number;
  heightMm: number;
  xPct: number;
  yPct: number;
  /* Signal Parameters */
  radius: number;
  slope: number;
  threshold: number;
};

function defaultInkPage(): InkPageState {
  return {
    inputActive: false,
    inputSolidOnly: false,
    inputC: 255,
    inputM: 242,
    inputY: 118,
    inputK: 152,
    inputLock: false,
    gammaCommon: 49,
    gammaC: 73,
    gammaM: 49,
    gammaY: 49,
    gammaK: 49,
    gammaLock: false,
    patch: false,
    rotate: false,
    spaceMm: 1,
    widthMm: 42,
    heightMm: 7,
    xPct: 55,
    yPct: 10,
    radius: 5.95,
    slope: 4,
    threshold: 3.99,
  };
}

/* ─── Ink Page Component ─────────────────────────────────── */
const InkPage = ({
  state,
  onChange,
}: {
  state: InkPageState;
  onChange: (patch: Partial<InkPageState>) => void;
}) => {
  const [resetHover, setResetHover] = useState(false);
  const CYAN = "#06b6d4";
  const MAGENTA = "#d946ef";
  const YELLOW = "#ca8a04";
  const BLACK = "#64748b";

  const liveInputColor = cmykToRgb(state.inputC, state.inputM, state.inputY, state.inputK).hex;
  const liveGammaColor = cmykToRgb(
    Math.round((state.gammaC / 100) * 255),
    Math.round((state.gammaM / 100) * 255),
    Math.round((state.gammaY / 100) * 255),
    Math.round((state.gammaK / 100) * 255)
  ).hex;

  function handleInputPickerChange(hex: string) {
    const { c, m, y, k } = hexToCmyk(hex);
    onChange({ inputC: c, inputM: m, inputY: y, inputK: k });
  }
  function handleGammaPickerChange(hex: string) {
    const { c, m, y, k } = hexToCmyk(hex);
    onChange({
      gammaC: Math.round((c / 255) * 100),
      gammaM: Math.round((m / 255) * 100),
      gammaY: Math.round((y / 255) * 100),
      gammaK: Math.round((k / 255) * 100),
    });
  }

  return (
    <>
      {/* ── White / Reset ──────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <button className="flex-[2] py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all shadow-sm">
          White
        </button>
        <button
          className="flex-[1] py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm"
          style={{
            borderColor: resetHover ? "#991b1b" : "#e5e7eb",
            background: resetHover ? "#991b1b" : "white",
            color: resetHover ? "white" : "#6b7280",
          }}
          onMouseEnter={() => setResetHover(true)}
          onMouseLeave={() => setResetHover(false)}
          onClick={() => onChange(defaultInkPage())}
        >
          Reset
        </button>
      </div>

      {/* ── Two-column layout: Recipes left, Patch right ─── */}
      <div className="flex gap-4 items-start">

        {/* ── Left column: Recipes ───────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* ── Input Recipe ─────────────────────────────── */}
          <SectionCard
            title="Input Recipe"
            active={state.inputActive}
            onActiveToggle={() => onChange({ inputActive: !state.inputActive })}
            solidOnly={state.inputSolidOnly}
            onSolidOnlyToggle={() => onChange({ inputSolidOnly: !state.inputSolidOnly })}
            locked={state.inputLock}
            onLockToggle={() => onChange({ inputLock: !state.inputLock })}
            showControls
            accent="#6366f1"
            frameColor={liveInputColor}
          >
            <ColorPickerSwatch color={liveInputColor} onChange={handleInputPickerChange} label="Input Color" />
            <ChannelRow label="C" value={state.inputC} onChange={(v) => onChange({ inputC: v })} accentColor={CYAN} />
            <ChannelRow label="M" value={state.inputM} onChange={(v) => onChange({ inputM: v })} accentColor={MAGENTA} />
            <ChannelRow label="Y" value={state.inputY} onChange={(v) => onChange({ inputY: v })} accentColor={YELLOW} />
            <ChannelRow label="K" value={state.inputK} onChange={(v) => onChange({ inputK: v })} accentColor={BLACK} />
            <CmykRgbEditor
              c={state.inputC} m={state.inputM} y={state.inputY} k={state.inputK}
              maxVal={255}
              onChange={(vals) => onChange(vals as Partial<InkPageState>)}
            />
          </SectionCard>

          {/* ── Gamma Recipe ─────────────────────────────── */}
          <SectionCard
            title="Gamma Recipe"
            locked={state.gammaLock}
            onLockToggle={() => onChange({ gammaLock: !state.gammaLock })}
            showControls
            accent="#16a34a"
            frameColor={liveGammaColor}
          >
            <ColorPickerSwatch color={liveGammaColor} onChange={handleGammaPickerChange} label="Gamma Color" />
            <ChannelRow label="⊕" value={state.gammaCommon} onChange={(v) => onChange({ gammaCommon: v })} accentColor="#94a3b8" max={100} />
            <ChannelRow label="C" value={state.gammaC} onChange={(v) => onChange({ gammaC: v })} accentColor={CYAN} max={100} />
            <ChannelRow label="M" value={state.gammaM} onChange={(v) => onChange({ gammaM: v })} accentColor={MAGENTA} max={100} />
            <ChannelRow label="Y" value={state.gammaY} onChange={(v) => onChange({ gammaY: v })} accentColor={YELLOW} max={100} />
            <ChannelRow label="K" value={state.gammaK} onChange={(v) => onChange({ gammaK: v })} accentColor={BLACK} max={100} />
            <CmykRgbEditor
              c={state.gammaC} m={state.gammaM} y={state.gammaY} k={state.gammaK}
              maxVal={100}
              onChange={(vals) => {
                const mapped: Partial<InkPageState> = {};
                if (vals.c !== undefined) mapped.gammaC = vals.c;
                if (vals.m !== undefined) mapped.gammaM = vals.m;
                if (vals.y !== undefined) mapped.gammaY = vals.y;
                if (vals.k !== undefined) mapped.gammaK = vals.k;
                onChange(mapped);
              }}
            />
          </SectionCard>
        </div>

        {/* ── Right column: Patch + Signal ───────────────── */}
        <div className="w-48 flex-shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3 shadow-sm">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold tracking-widest uppercase text-orange-500">Patch</span>
            </div>
            <div className="px-3 py-3 flex flex-col gap-3">
              <MetricSlider label="Space" value={state.spaceMm} onChange={(v) => onChange({ spaceMm: v })} min={0} max={20} unit=" mm" />
              <MetricSlider label="Width" value={state.widthMm} onChange={(v) => onChange({ widthMm: v })} min={1} max={200} unit=" mm" />
              <MetricSlider label="Height" value={state.heightMm} onChange={(v) => onChange({ heightMm: v })} min={1} max={100} unit=" mm" />
              <MetricSlider label="X Pos" value={state.xPct} onChange={(v) => onChange({ xPct: v })} min={0} max={100} unit="%" />
              <MetricSlider label="Y Pos" value={state.yPct} onChange={(v) => onChange({ yPct: v })} min={0} max={100} unit="%" />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onChange({ patch: !state.patch })}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200"
                  style={{
                    borderColor: state.patch ? "#f97316" : "#d1d5db",
                    color: state.patch ? "#f97316" : "#9ca3af",
                    background: state.patch ? "#f9731615" : "transparent",
                  }}
                >
                  Patch
                </button>
                <button
                  onClick={() => onChange({ rotate: !state.rotate })}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200"
                  style={{
                    borderColor: state.rotate ? "#f97316" : "#d1d5db",
                    color: state.rotate ? "#f97316" : "#9ca3af",
                    background: state.rotate ? "#f9731615" : "transparent",
                  }}
                >
                  Rotate
                </button>
              </div>
            </div>
          </div>

          {/* ── Signal Parameters (under Patch) ──────────── */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold tracking-widest uppercase text-pink-500">Signal</span>
            </div>
            <div className="px-3 py-3 flex flex-col gap-3">
              <MetricSlider label="Radius" value={state.radius} onChange={(v) => onChange({ radius: v })} min={0} max={20} step={0.01} />
              <MetricSlider label="Slope" value={state.slope} onChange={(v) => onChange({ slope: v })} min={0} max={20} step={0.1} />
              <MetricSlider label="Threshold" value={state.threshold} onChange={(v) => onChange({ threshold: v })} min={0} max={20} step={0.01} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

/* ─── Custom Select ──────────────────────────────────────── */
const COLORING_OPTIONS = ["None", "CT", "Shade", "Weight", "Ink in White", "CT Shade & Weight", "trapped Inks ONLY"];

const CustomSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full" onBlur={handleBlur} tabIndex={-1}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 hover:border-indigo-300 hover:bg-gray-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <span className="truncate">{value}</span>
        <svg
          className="flex-shrink-0 w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden">
          {COLORING_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              tabIndex={0}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm transition-colors duration-100"
              style={{
                background: value === opt ? "#eef2ff" : "transparent",
                color: value === opt ? "#6366f1" : "#374151",
                fontWeight: value === opt ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (value !== opt) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { if (value !== opt) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
export const Screenshot = (): JSX.Element => {
  const [coloring, setColoring] = useState("None");
  const [bypass3DK, setBypass3DK] = useState(false);
  const [bypassJob, setBypassJob] = useState(false);
  const [annotate, setAnnotate] = useState(false);
  const [pantones, setPantones] = useState(false);
  const [activeTop, setActiveTop] = useState(false);
  const [divider, setDivider] = useState(46.2);
  const [vertical, setVertical] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [inkPages, setInkPages] = useState<InkPageState[]>(() =>
    Array.from({ length: 6 }, () => defaultInkPage())
  );

  const tabs = ["Ink 0", "Ink 1", "Ink 2", "Ink 3", "Ink 4", "Ink 5"];

  const CYAN = "#06b6d4";
  const MAGENTA = "#d946ef";
  const YELLOW = "#ca8a04";
  const BLACK = "#64748b";

  function updateInkPage(index: number, patch: Partial<InkPageState>) {
    setInkPages((prev) =>
      prev.map((page, i) => (i === index ? { ...page, ...patch } : page))
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-3xl">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          <button className="flex-[2] py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800 transition-all shadow-sm">
            File
          </button>
          <button className="flex-[2] py-2 rounded-xl text-sm font-semibold bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 transition-all">
            Get Inks
          </button>
          <button className="flex-[1] py-2 rounded-xl text-sm font-semibold bg-white text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-500 transition-all shadow-sm">
            Quit
          </button>
        </div>

        {/* ── Top toggles ───────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <ToggleChip label="Annotate" active={annotate} onChange={() => setAnnotate(!annotate)} />
          <ToggleChip label="Pantones" active={pantones} onChange={() => setPantones(!pantones)} />
          <ToggleChip label="Active" active={activeTop} onChange={() => setActiveTop(!activeTop)} accent="#16a34a" />
          <ToggleChip label="Bypass 3D+K LUT" active={bypass3DK} onChange={() => setBypass3DK(!bypass3DK)} accent="#f59e0b" />
          <ToggleChip label="Bypass Job LUT" active={bypassJob} onChange={() => setBypassJob(!bypassJob)} accent="#f59e0b" />
        </div>

        {/* ── Coloring + Divider row ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <label className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase block mb-2">Coloring</label>
            <CustomSelect value={coloring} onChange={setColoring} />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Divider</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-gray-500">{divider.toFixed(1)}%</span>
                <ToggleChip label="Vertical" active={vertical} onChange={() => setVertical(!vertical)} accent="#818cf8" />
              </div>
            </div>
            <ModernSlider value={divider} onChange={setDivider} min={0} max={100} step={0.1} accentColor="#818cf8" />
          </div>
        </div>

        {/* ── Ink Tabs ──────────────────────────────────────── */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTab === i ? "#eef2ff" : "transparent",
                color: activeTab === i ? "#6366f1" : "#9ca3af",
                border: activeTab === i ? "1px solid #c7d2fe" : "1px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Active Ink Page ───────────────────────────────── */}
        <InkPage
          key={activeTab}
          state={inkPages[activeTab]}
          onChange={(patch) => updateInkPage(activeTab, patch)}
        />

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1 mt-2 mb-1">
          {[CYAN, MAGENTA, YELLOW, BLACK].map((c, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-gray-400 ml-2 font-mono">CMYK · Print Engine · 2026</span>
        </div>

      </div>
    </div>
  );
};
