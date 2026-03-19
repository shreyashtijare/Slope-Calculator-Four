export function initSlopeCalculator() {
  const he = document.getElementById("he");
  const le = document.getElementById("le");
  const distance = document.getElementById("distance");
  const slope = document.getElementById("slope");
  const result = document.getElementById("result");
  const calculateBtn = document.getElementById("calculateBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (calculateBtn) {
    calculateBtn.onclick = () => {
      const HE = parseFloat(he.value);
      const LE = parseFloat(le.value);
      const D = parseFloat(distance.value);
      const S = parseFloat(slope.value);

      if ([HE, LE, D, S].filter(v => !isNaN(v)).length < 3) {
        if (result) result.textContent = "⚠️ Enter any 3 values.";
        return;
      }

      if (isNaN(S)) {
        slope.value = (((HE - LE) / D) * 100).toFixed(3);
        if (result) result.textContent = "Slope calculated.";
      } else if (isNaN(D)) {
        distance.value = ((HE - LE) / (S / 100)).toFixed(3);
        if (result) result.textContent = "Distance calculated.";
      } else if (isNaN(HE)) {
        he.value = (LE + D * (S / 100)).toFixed(3);
        if (result) result.textContent = "Higher elevation calculated.";
      } else if (isNaN(LE)) {
        le.value = (HE - D * (S / 100)).toFixed(3);
        if (result) result.textContent = "Lower elevation calculated.";
      }
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (he) he.value = "";
      if (le) le.value = "";
      if (distance) distance.value = "";
      if (slope) slope.value = "";
      if (result) result.textContent = "";
    };
  }
}