import "./style.css";

const form = document.querySelector("#bmi-form");
const heightInput = document.querySelector("#height");
const weightInput = document.querySelector("#weight");
const errorBox = document.querySelector("#error");
const resultBox = document.querySelector("#result");
const chartsBox = document.querySelector("#charts");
const bmiValueEl = document.querySelector("#bmi-value");
const bmiCategoryEl = document.querySelector("#bmi-category");
const bmiTipEl = document.querySelector("#bmi-tip");
const bmiGaugeEl = document.querySelector("#bmi-gauge");
const weightRangeEl = document.querySelector("#weight-range");
const compactMediaQuery = window.matchMedia("(max-width: 500px)");

const lastCalculation = {
  heightCm: null,
  weightKg: null,
  bmi: null
};

const categories = [
  {
    min: 0,
    max: 18.5,
    label: "Sottopeso",
    className: "under",
    tip: "Puoi puntare su alimentazione bilanciata e allenamento di forza leggero."
  },
  {
    min: 18.5,
    max: 25,
    label: "Normopeso",
    className: "normal",
    tip: "Ottimo range: continua con routine attiva e alimentazione regolare."
  },
  {
    min: 25,
    max: 30,
    label: "Sovrappeso",
    className: "over",
    tip: "Piccoli cambiamenti costanti su dieta e movimento fanno la differenza."
  },
  {
    min: 30,
    max: Number.POSITIVE_INFINITY,
    label: "Obesita",
    className: "obese",
    tip: "Valuta un confronto con professionisti per un piano personalizzato."
  }
];

const bmiScaleMax = 40;

const chartColors = {
  under: "#f9c8c8",
  normal: "#9fe3c3",
  over: "#ffd19b",
  obese: "#f2a7a7",
  ink: "#132322",
  muted: "#66757a",
  track: "#eadfd2",
  white: "#fffdf8"
};

function getCategory(bmi) {
  return categories.find((item) => bmi < item.max) ?? categories[categories.length - 1];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatOneDecimal(value) {
  return value.toFixed(1);
}

function isCompactView() {
  return compactMediaQuery.matches;
}

function renderBmiGauge(bmi, compact = isCompactView()) {
  if (!bmiGaugeEl) {
    return;
  }

  const width = 560;
  const height = compact ? 142 : 168;
  const barX = 24;
  const barY = compact ? 58 : 64;
  const barWidth = width - barX * 2;
  const barHeight = compact ? 16 : 18;
  const pointerX = barX + (clamp(bmi, 0, bmiScaleMax) / bmiScaleMax) * barWidth;
  const currentCategory = getCategory(bmi);

  const segments = categories
    .map((category) => {
      const segmentStart = category.min;
      const segmentEnd = Math.min(category.max, bmiScaleMax);
      if (segmentEnd <= segmentStart) {
        return "";
      }

      const x = barX + (segmentStart / bmiScaleMax) * barWidth;
      const segmentWidth = ((segmentEnd - segmentStart) / bmiScaleMax) * barWidth;
      const fill = chartColors[category.className] ?? chartColors.track;

      return `<rect x="${x}" y="${barY}" width="${segmentWidth}" height="${barHeight}" rx="9" fill="${fill}" />`;
    })
    .join("");

  const ticks = [18.5, 25, 30]
    .map((tick) => {
      const x = barX + (tick / bmiScaleMax) * barWidth;
      return `
        <g>
          <line x1="${x}" y1="${barY - 8}" x2="${x}" y2="${barY + barHeight + 8}" stroke="rgba(19,35,34,0.12)" stroke-width="1" stroke-dasharray="2 4" />
          <text x="${x}" y="${barY + (compact ? 34 : 44)}" text-anchor="middle" fill="${chartColors.muted}" font-size="${compact ? 11 : 12}">${tick}</text>
        </g>
      `;
    })
    .join("");

  const bandLabels = compact
    ? `
      <text x="${barX}" y="${compact ? 100 : 112}" fill="${chartColors.muted}" font-size="12">Sottopeso</text>
      <text x="${width / 2}" y="${compact ? 100 : 112}" text-anchor="middle" fill="${chartColors.muted}" font-size="12">Normopeso</text>
      <text x="${width - barX}" y="${compact ? 100 : 112}" text-anchor="end" fill="${chartColors.muted}" font-size="12">Obesità</text>
    `
    : `
      <text x="${barX}" y="112" fill="${chartColors.muted}" font-size="13">Sottopeso</text>
      <text x="${width / 2}" y="112" text-anchor="middle" fill="${chartColors.muted}" font-size="13">Normopeso</text>
      <text x="${width - barX}" y="112" text-anchor="end" fill="${chartColors.muted}" font-size="13">Obesità</text>
    `;

  bmiGaugeEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Scala BMI con indicatore del valore attuale">
      <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="9" fill="${chartColors.track}" />
      ${segments}
      ${ticks}
      <line x1="${pointerX}" y1="26" x2="${pointerX}" y2="${barY + barHeight + 26}" stroke="${chartColors.ink}" stroke-width="2.5" />
      <circle cx="${pointerX}" cy="${barY - 2}" r="7" fill="${chartColors.ink}" />
      <rect x="${clamp(pointerX - (compact ? 36 : 42), 16, width - (compact ? 92 : 100))}" y="12" width="${compact ? 72 : 84}" height="28" rx="14" fill="${chartColors.white}" stroke="rgba(19,35,34,0.14)" />
      <text x="${clamp(pointerX, compact ? 52 : 58, width - (compact ? 52 : 58))}" y="31" text-anchor="middle" fill="${chartColors.ink}" font-size="${compact ? 13 : 14}" font-weight="700">BMI ${formatOneDecimal(bmi)}</text>
      ${bandLabels}
      <text x="${width / 2}" y="${compact ? 126 : 146}" text-anchor="middle" fill="${chartColors.ink}" font-size="${compact ? 12 : 13}" font-weight="700">${currentCategory.label}</text>
    </svg>
  `;
}

function renderWeightRange(heightCm, weightKg, compact = isCompactView()) {
  if (!weightRangeEl) {
    return;
  }

  const width = 560;
  const height = compact ? 158 : 182;
  const chartX = 24;
  const chartY = compact ? 60 : 66;
  const chartWidth = width - chartX * 2;
  const chartHeight = compact ? 16 : 18;
  const healthyMin = 18.5 * Math.pow(heightCm / 100, 2);
  const healthyMax = 24.9 * Math.pow(heightCm / 100, 2);
  const axisMin = Math.max(30, Math.min(healthyMin, weightKg) * 0.78);
  const axisMax = Math.min(300, Math.max(healthyMax, weightKg) * 1.22);
  const span = Math.max(axisMax - axisMin, 1);
  const rangeStart = chartX + ((healthyMin - axisMin) / span) * chartWidth;
  const rangeWidth = ((healthyMax - healthyMin) / span) * chartWidth;
  const pointerX = chartX + ((weightKg - axisMin) / span) * chartWidth;
  const underWidth = Math.max(rangeStart - chartX, 0);
  const overStart = rangeStart + rangeWidth;
  const overWidth = Math.max(chartX + chartWidth - overStart, 0);
  const minLabelX = chartX;
  const maxLabelX = chartX + chartWidth;

  const underSegment = underWidth
    ? `<rect x="${chartX}" y="${chartY}" width="${underWidth}" height="${chartHeight}" rx="9" fill="${chartColors.track}" />`
    : "";
  const healthySegment = `<rect x="${rangeStart}" y="${chartY}" width="${rangeWidth}" height="${chartHeight}" rx="9" fill="${chartColors.normal}" />`;
  const overSegment = overWidth
    ? `<rect x="${overStart}" y="${chartY}" width="${overWidth}" height="${chartHeight}" rx="9" fill="${chartColors.track}" />`
    : "";

  const axisTextY = compact ? 106 : 112;
  const summaryY = compact ? 138 : 150;
  const footerY = compact ? 154 : 170;

  weightRangeEl.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Range di peso consigliato per l'altezza inserita">
      ${underSegment}
      ${healthySegment}
      ${overSegment}
      <line x1="${pointerX}" y1="26" x2="${pointerX}" y2="${chartY + chartHeight + 28}" stroke="${chartColors.ink}" stroke-width="2.5" />
      <circle cx="${pointerX}" cy="${chartY - 2}" r="7" fill="${chartColors.ink}" />
      <rect x="${clamp(pointerX - (compact ? 48 : 58), 16, width - (compact ? 120 : 132))}" y="12" width="${compact ? 96 : 116}" height="28" rx="14" fill="${chartColors.white}" stroke="rgba(19,35,34,0.14)" />
      <text x="${clamp(pointerX, compact ? 64 : 74, width - (compact ? 64 : 74))}" y="31" text-anchor="middle" fill="${chartColors.ink}" font-size="${compact ? 13 : 14}" font-weight="700">${formatOneDecimal(weightKg)} kg</text>
      <text x="${minLabelX}" y="${axisTextY}" fill="${chartColors.muted}" font-size="${compact ? 12 : 13}">${formatOneDecimal(axisMin)} kg</text>
      <text x="${rangeStart}" y="${axisTextY}" text-anchor="middle" fill="${chartColors.muted}" font-size="${compact ? 12 : 13}">${formatOneDecimal(healthyMin)} kg</text>
      <text x="${rangeStart + rangeWidth}" y="${axisTextY}" text-anchor="middle" fill="${chartColors.muted}" font-size="${compact ? 12 : 13}">${formatOneDecimal(healthyMax)} kg</text>
      <text x="${maxLabelX}" y="${axisTextY}" text-anchor="end" fill="${chartColors.muted}" font-size="${compact ? 12 : 13}">${formatOneDecimal(axisMax)} kg</text>
      <text x="${width / 2}" y="${summaryY}" text-anchor="middle" fill="${chartColors.ink}" font-size="${compact ? 12 : 13}" font-weight="700">Peso sano stimato: ${formatOneDecimal(healthyMin)} - ${formatOneDecimal(healthyMax)} kg</text>
      <text x="${width / 2}" y="${footerY}" text-anchor="middle" fill="${chartColors.muted}" font-size="${compact ? 11 : 12}">Calcolato sul normopeso (BMI 18.5 - 24.9)</text>
    </svg>
  `;
}

function validateValues(heightCm, weightKg) {
  if (Number.isNaN(heightCm) || Number.isNaN(weightKg)) {
    return "Inserisci numeri validi per altezza e peso.";
  }

  if (heightCm < 120 || heightCm > 230) {
    return "Altezza fuori range: usa un valore tra 120 e 230 cm.";
  }

  if (weightKg < 30 || weightKg > 300) {
    return "Peso fuori range: usa un valore tra 30 e 300 kg.";
  }

  return "";
}

function renderError(message) {
  errorBox.textContent = message;
  resultBox.classList.add("hidden");
  chartsBox?.classList.add("hidden");
}

function clearError() {
  errorBox.textContent = "";
}

function renderResult(bmi) {
  const category = getCategory(bmi);
  const rounded = formatOneDecimal(bmi);

  resultBox.classList.remove("hidden");
  chartsBox?.classList.remove("hidden");
  bmiValueEl.textContent = rounded;
  bmiCategoryEl.textContent = category.label;
  bmiCategoryEl.className = `badge ${category.className}`;
  bmiTipEl.textContent = category.tip;
  renderBmiGauge(bmi);
}

function renderCharts() {
  if (
    lastCalculation.heightCm === null ||
    lastCalculation.weightKg === null ||
    lastCalculation.bmi === null
  ) {
    return;
  }

  renderBmiGauge(lastCalculation.bmi);
  renderWeightRange(lastCalculation.heightCm, lastCalculation.weightKg);
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const heightCm = Number.parseFloat(heightInput?.value ?? "");
  const weightKg = Number.parseFloat(weightInput?.value ?? "");

  const validationError = validateValues(heightCm, weightKg);
  if (validationError) {
    renderError(validationError);
    return;
  }

  clearError();
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  lastCalculation.heightCm = heightCm;
  lastCalculation.weightKg = weightKg;
  lastCalculation.bmi = bmi;

  renderResult(bmi);
  renderWeightRange(heightCm, weightKg);
});

compactMediaQuery.addEventListener("change", renderCharts);
