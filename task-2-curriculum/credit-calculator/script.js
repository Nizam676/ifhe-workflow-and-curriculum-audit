
const totalInput = document.getElementById("totalCredits");
const affectedInput = document.getElementById("affectedCredits");
const semesterInput = document.getElementById("originalSemester");
const netInput = document.getElementById("netChange");

const statusOutput = document.getElementById("status");
const lowerOutput = document.getElementById("lowerTarget");
const upperOutput = document.getElementById("upperTarget");
const affectedOutput = document.getElementById("affectedResult");
const percentageOutput = document.getElementById("percentageResult");
const netOutput = document.getElementById("netResult");
const explanationOutput = document.getElementById("explanation");

const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");

function formatNumber(value) {
  return Number(value.toFixed(2)).toLocaleString("en-IN");
}

function calculateImpact() {
  const total = Number(totalInput.value);
  const affected = Number(affectedInput.value);
  const netChange = Number(netInput.value);

  if (
    totalInput.value.trim() === "" ||
    affectedInput.value.trim() === "" ||
    netInput.value.trim() === ""
  ) {
    statusOutput.textContent = "Please fill in all credit fields.";
    return;
  }

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(affected) ||
    !Number.isFinite(netChange) ||
    total <= 0 ||
    affected < 0 ||
    affected > total
  ) {
    statusOutput.textContent =
      "Check your inputs. Total credits must be positive, and affected credits must be between zero and the total.";
    return;
  }

  if (semesterInput.value === "") {
    statusOutput.textContent = "Please select a semester to review.";
    return;
  }

  const lowerTarget = total * 0.20;
  const upperTarget = total * 0.25;
  const percentage = (affected / total) * 100;

  lowerOutput.textContent = formatNumber(lowerTarget);
  upperOutput.textContent = formatNumber(upperTarget);
  affectedOutput.textContent = formatNumber(affected);
  percentageOutput.textContent = `${formatNumber(percentage)}%`;
  netOutput.textContent =
    `${netChange > 0 ? "+" : ""}${formatNumber(netChange)}`;

  if (percentage < 20) {
    statusOutput.textContent = "Below the target range.";
  } else if (percentage <= 25) {
    statusOutput.textContent = "Within the target range.";
  } else {
    statusOutput.textContent = "Above the target range.";
  }

  explanationOutput.textContent =
    `Semester ${semesterInput.value} selected. ` +
    `${formatNumber(affected)} of ${formatNumber(total)} programme ` +
    `credits are affected (${formatNumber(percentage)}%). ` +
    `The net programme-credit change is ${formatNumber(netChange)}. ` +
    `Confirm that each affected credit is counted only once and that ` +
    `semester totals and prerequisites remain valid.`;
}

function resetCalculator() {
  totalInput.value = "";
  affectedInput.value = "";
  semesterInput.value = "";
  netInput.value = "0";

  lowerOutput.textContent = "—";
  upperOutput.textContent = "—";
  affectedOutput.textContent = "—";
  percentageOutput.textContent = "—";
  netOutput.textContent = "—";

  statusOutput.textContent =
    "Enter verified credits to calculate the impact.";
  explanationOutput.textContent = "";
}

calculateButton.addEventListener("click", calculateImpact);
resetButton.addEventListener("click", resetCalculator);
