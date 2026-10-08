const FIELDS = [
  { key: "focus", label: "Fokus (daqiqa)", min: 1, max: 90 },
  { key: "short", label: "Qisqa tanaffus", min: 1, max: 30 },
  { key: "long", label: "Uzun tanaffus", min: 1, max: 60 },
  { key: "longEvery", label: "Uzun tanaffusgacha", min: 2, max: 8 },
];

export default function Settings({ settings, onChange, onReset }) {
  const setNum = (key, min, max, raw) => {
    const n = Math.min(max, Math.max(min, Number(raw) || min));
    onChange({ ...settings, [key]: n });
  };

  return (
    <section className="settings" aria-label="Sozlamalar">
      <div className="fields">
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={f.min}
              max={f.max}
              value={settings[f.key]}
              onChange={(e) => setNum(f.key, f.min, f.max, e.target.value)}
            />
          </label>
        ))}
      </div>

      <label className="check">
        <input type="checkbox" checked={settings.autoStart} onChange={(e) => onChange({ ...settings, autoStart: e.target.checked })} />
        <span>Keyingi bosqichni o'zi boshlasin</span>
      </label>
      <label className="check">
        <input type="checkbox" checked={settings.sound} onChange={(e) => onChange({ ...settings, sound: e.target.checked })} />
        <span>Tovushli signal</span>
      </label>

      <button type="button" className="link" onClick={onReset}>Standart sozlamalarga qaytarish</button>
    </section>
  );
}
