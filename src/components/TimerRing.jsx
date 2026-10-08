const R = 130;
const C = 2 * Math.PI * R;

export default function TimerRing({ left, total, label, running }) {
  const progress = total ? 1 - left / total : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="ring" role="timer" aria-label={`${mm}:${ss} qoldi`}>
      <svg viewBox="0 0 300 300">
        <circle className="ring-bg" cx="150" cy="150" r={R} />
        <circle
          className="ring-fg"
          cx="150"
          cy="150"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
        />
      </svg>
      <div className="ring-text">
        <span className="time">{mm}:{ss}</span>
        <span className="state">{running ? label : "Pauza"}</span>
      </div>
    </div>
  );
}
