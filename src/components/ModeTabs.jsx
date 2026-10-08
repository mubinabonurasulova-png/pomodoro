const MODES = [
  { id: "focus", label: "Fokus" },
  { id: "short", label: "Qisqa tanaffus" },
  { id: "long", label: "Uzun tanaffus" },
];

export default function ModeTabs({ value, onChange }) {
  return (
    <div className="tabs" role="group" aria-label="Rejim">
      {MODES.map((m) => (
        <button key={m.id} type="button" aria-pressed={value === m.id} onClick={() => onChange(m.id)}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
