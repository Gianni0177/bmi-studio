import "./style.css";

const form = document.querySelector("#bmi-form");
const heightInput = document.querySelector("#height");
const weightInput = document.querySelector("#weight");
const errorBox = document.querySelector("#error");
const resultBox = document.querySelector("#result");
const bmiValueEl = document.querySelector("#bmi-value");
const bmiCategoryEl = document.querySelector("#bmi-category");
const bmiTipEl = document.querySelector("#bmi-tip");

const categories = [
  {
    max: 18.5,
    label: "Sottopeso",
    className: "under",
    tip: "Puoi puntare su alimentazione bilanciata e allenamento di forza leggero."
  },
  {
    max: 25,
    label: "Normopeso",
    className: "normal",
    tip: "Ottimo range: continua con routine attiva e alimentazione regolare."
  },
  {
    max: 30,
    label: "Sovrappeso",
    className: "over",
    tip: "Piccoli cambiamenti costanti su dieta e movimento fanno la differenza."
  },
  {
    max: Number.POSITIVE_INFINITY,
    label: "Obesita",
    className: "obese",
    tip: "Valuta un confronto con professionisti per un piano personalizzato."
  }
];

function getCategory(bmi) {
  return categories.find((item) => bmi < item.max) ?? categories[categories.length - 1];
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
}

function clearError() {
  errorBox.textContent = "";
}

function renderResult(bmi) {
  const category = getCategory(bmi);
  const rounded = bmi.toFixed(1);

  resultBox.classList.remove("hidden");
  bmiValueEl.textContent = rounded;
  bmiCategoryEl.textContent = category.label;
  bmiCategoryEl.className = `badge ${category.className}`;
  bmiTipEl.textContent = category.tip;
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
  renderResult(bmi);
});
