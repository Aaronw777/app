import { useState } from "react";
import { X, Save } from "lucide-react";

const CATEGORIES = [
  "Warm-Up",
  "Ball Handling",
  "Shooting",
  "Passing",
  "Footwork",
  "Defense",
  "Rebounding",
  "Conditioning",
  "Basketball IQ",
  "Custom",
];

export default function CustomDrillForm({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    category: "Custom",
    duration: 10,
    level: 2,
    description: "",
    coach_notes: "",
  });

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    onSave({
      id: `custom-${Date.now()}`,
      custom: true,
      video: "",
      ...form,
    });
    setForm({
      name: "",
      category: "Custom",
      duration: 10,
      level: 2,
      description: "",
      coach_notes: "",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      data-testid="custom-drill-overlay"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="bg-[#0d0d0d] border border-white/10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#FF7324] font-bold">
              Coach&apos;s Own
            </div>
            <div className="font-display text-2xl uppercase tracking-wide mt-1">
              Custom Drill
            </div>
          </div>
          <button
            type="button"
            data-testid="custom-drill-close"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Drill Name" required>
            <input
              data-testid="custom-drill-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g. 5-Star Passing Under Pressure"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                data-testid="custom-drill-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Duration (min)">
              <input
                data-testid="custom-drill-duration"
                type="number"
                min={1}
                max={60}
                required
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })}
                className="input"
              />
            </Field>
          </div>
          <Field label="Level (0-5)">
            <input
              data-testid="custom-drill-level"
              type="range"
              min={0}
              max={5}
              value={form.level}
              onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
              className="w-full accent-[#FFCD00]"
            />
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
              Level {form.level}
            </div>
          </Field>
          <Field label="Description">
            <textarea
              data-testid="custom-drill-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="How the drill runs..."
              className="input resize-y"
            />
          </Field>
          <Field label="Coach Notes">
            <textarea
              data-testid="custom-drill-notes"
              value={form.coach_notes}
              onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
              rows={2}
              placeholder="Key cues, why this drill, what to watch for..."
              className="input resize-y"
            />
          </Field>
        </div>
        <div className="border-t border-white/10 p-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="custom-drill-cancel"
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="custom-drill-save"
            className="btn-primary"
            disabled={!form.name.trim()}
          >
            <Save size={14} /> Add to Session
          </button>
        </div>
      </form>
      <style>{`
        .input {
          width: 100%;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 0.65rem 0.85rem;
          border-radius: 2px;
          font-size: 0.9rem;
        }
        .input:focus {
          outline: none;
          border-color: #FFCD00;
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 mb-1.5 font-bold">
        {label} {required && <span className="text-[#FFCD00]">*</span>}
      </div>
      {children}
    </label>
  );
}
