export function initSlopeConverter() {
  const convPercent = document.getElementById("convPercent");
  const ratioRise = document.getElementById("ratioRise");
  const ratioRun = document.getElementById("ratioRun");
  const convAngle = document.getElementById("convAngle");
  const convertBtn = document.getElementById("convertBtn");

  if (convertBtn) {
    convertBtn.onclick = () => {
      const p = parseFloat(convPercent.value);
      const r = parseFloat(ratioRise.value);
      const run = parseFloat(ratioRun.value);
      const a = parseFloat(convAngle.value);
      const out = document.getElementById("convResult");

      if (!isNaN(p)) {
        const angle = Math.atan(p / 100) * 180 / Math.PI;
        if (out) out.innerHTML = `${p}%<br>Ratio: 1:${(100 / p).toFixed(3)}<br>Angle: ${angle.toFixed(3)}°`;
        return;
      }

      if (!isNaN(r) && !isNaN(run)) {
        const percent = (r / run) * 100;
        const angle = Math.atan(r / run) * 180 / Math.PI;
        if (out) out.innerHTML = `${r}:${run}<br>Percent: ${percent.toFixed(3)}%<br>Angle: ${angle.toFixed(3)}°`;
        return;
      }

      if (!isNaN(a)) {
        const percent = Math.tan(a * Math.PI / 180) * 100;
        if (out) out.innerHTML = `${a}°<br>Percent: ${percent.toFixed(3)}%<br>Ratio: 1:${(100 / percent).toFixed(3)}`;
        return;
      }

      if (out) out.textContent = "⚠️ Enter a value to convert.";
    };
  }
}