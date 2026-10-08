import { useCallback, useEffect, useRef, useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage.js";
import TimerRing from "./components/TimerRing.jsx";
import ModeTabs from "./components/ModeTabs.jsx";
import Settings from "./components/Settings.jsx";
import { askNotifyPermission, notify, playBeep, unlockAudio } from "./utils/sound.js";

const DEFAULTS = { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false, sound: true };
const LABELS = { focus: "Fokus", short: "Tanaffus", long: "Uzun tanaffus" };
const today = () => new Date().toLocaleDateString("sv"); // YYYY-MM-DD

export default function App() {
  const [settings, setSettings] = useLocalStorage("mubi-pomo-settings", DEFAULTS);
  const [stats, setStats] = useLocalStorage("mubi-pomo-stats", { date: today(), count: 0, minutes: 0 });
  const [task, setTask] = useLocalStorage("mubi-pomo-task", "");

  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const endAt = useRef(0);
  const duration = (m) => settings[m] * 60;
  const total = duration(mode);

  // Yangi kun boshlansa statistika nolga tushadi
  const todayStats = stats.date === today() ? stats : { date: today(), count: 0, minutes: 0 };

  const startRun = useCallback((seconds) => {
    endAt.current = Date.now() + seconds * 1000;
    setRunning(true);
  }, []);

  const goTo = useCallback((next, autoRun) => {
    setMode(next);
    const secs = settings[next] * 60;
    setLeft(secs);
    if (autoRun) startRun(secs);
    else setRunning(false);
  }, [settings, startRun]);

  // Vaqt tugaganda
  const complete = () => {
    if (settings.sound) playBeep();
    let next;
    if (mode === "focus") {
      const done = cycles + 1;
      setCycles(done);
      setStats({
        date: today(),
        count: todayStats.count + 1,
        minutes: todayStats.minutes + settings.focus,
      });
      next = done % settings.longEvery === 0 ? "long" : "short";
      notify("Fokus tugadi 🎉", next === "long" ? "Uzun tanaffus vaqti" : "Qisqa tanaffus qiling");
    } else {
      next = "focus";
      notify("Tanaffus tugadi", "Yana ishga qaytamiz");
    }
    goTo(next, settings.autoStart);
  };
  const completeRef = useRef(complete);
  completeRef.current = complete;

  // Taymer: tugash vaqtiga qarab hisoblanadi (tab orqada qolsa ham aniq ishlaydi)
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remain = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) completeRef.current();
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // Sozlama o'zgarsa (taymer to'xtab turgan bo'lsa) vaqt yangilanadi
  useEffect(() => {
    if (!running) setLeft(settings[mode] * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focus, settings.short, settings.long, mode]);

  // Brauzer tabida vaqt va fon rangi
  useEffect(() => {
    document.body.dataset.mode = mode;
    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");
    document.title = running ? `${mm}:${ss} · ${LABELS[mode]}` : "Pomodoro";
  }, [left, mode, running]);

  const toggle = useCallback(() => {
    unlockAudio();
    if (running) {
      setRunning(false);
    } else {
      if (left === 0) return;
      if (mode === "focus" && !running) askNotifyPermission();
      startRun(left);
    }
  }, [running, left, mode, startRun]);

  const reset = () => {
    setRunning(false);
    setLeft(duration(mode));
  };
  const skip = () => {
    setRunning(false);
    const next = mode === "focus" ? ((cycles + 1) % settings.longEvery === 0 ? "long" : "short") : "focus";
    if (mode === "focus") setCycles((c) => c + 1);
    goTo(next, false);
  };
  const selectMode = (m) => goTo(m, false);

  // Space — boshlash / pauza
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space") return;
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA", "BUTTON", "SELECT"].includes(tag)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const filled = mode === "long" ? settings.longEvery : cycles % settings.longEvery;

  return (
    <main>
      <header>
        <h1>Pomodoro</h1>
        <button type="button" className="gear" aria-expanded={showSettings} onClick={() => setShowSettings((s) => !s)}>
          {showSettings ? "Yopish" : "Sozlamalar"}
        </button>
      </header>

      <ModeTabs value={mode} onChange={selectMode} />

      <TimerRing left={left} total={total} label={LABELS[mode]} running={running} />

      <input
        className="task"
        type="text"
        value={task}
        maxLength={80}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Nima ustida ishlayapsiz?"
        aria-label="Hozirgi vazifa"
      />

      <div className="controls">
        <button type="button" className="ghost" onClick={reset} aria-label="Qayta boshlash">↺</button>
        <button type="button" className="main-btn" onClick={toggle}>{running ? "Pauza" : left < total ? "Davom etish" : "Boshlash"}</button>
        <button type="button" className="ghost" onClick={skip} aria-label="Keyingisiga o'tish">⏭</button>
      </div>

      <div className="dots" aria-label={`${filled} / ${settings.longEvery} fokus bosqichi`}>
        {Array.from({ length: settings.longEvery }, (_, i) => (
          <i key={i} className={i < filled ? "on" : ""} />
        ))}
      </div>

      <div className="today">
        <div><b>{todayStats.count}</b><span>bugungi bosqich</span></div>
        <div><b>{todayStats.minutes}</b><span>daqiqa fokus</span></div>
      </div>

      {showSettings && (
        <Settings
          settings={settings}
          onChange={setSettings}
          onReset={() => setSettings(DEFAULTS)}
        />
      )}

      <p className="hint">Bo'sh joy (Space) tugmasi bilan boshlash va to'xtatish mumkin</p>
    </main>
  );
}
