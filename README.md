# Mubi Pomodoro

React + Vite da yozilgan Pomodoro timer.

## Imkoniyatlar
- Fokus (25 daq), qisqa tanaffus (5 daq), uzun tanaffus (15 daq)
- Har 4-fokusdan keyin uzun tanaffus (sozlanadi)
- Boshlash / pauza / qayta boshlash / keyingisiga o'tish
- Bo'sh joy (Space) tugmasi bilan boshqarish
- Tab nomida qolgan vaqt ko'rinadi
- Tugaganda tovushli signal va brauzer bildirishnomasi
- Bugungi bosqichlar va fokus daqiqalari hisobi
- Barcha sozlamalar saqlanadi (localStorage)
- Mobil, planshet va kompyuterda ishlaydi

## Ishga tushirish
```bash
npm install
npm run dev
```

## Saytga joylash
```bash
npm run build
```
`dist/` papkasini Vercel yoki Netlify'ga yuklang.

## Struktura
```
src/
  App.jsx
  index.css
  main.jsx
  hooks/useLocalStorage.js
  utils/sound.js
  components/ TimerRing, ModeTabs, Settings
```
