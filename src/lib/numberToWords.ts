const units = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertTwoDigits(num: number): string {
  if (num < 20) return units[num];
  const unit = num % 10;
  return tens[Math.floor(num / 10)] + (unit ? " " + units[unit] : "");
}

function convertThreeDigits(num: number): string {
  if (num === 0) return "";
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let str = "";
  if (hundred > 0) {
    str += units[hundred] + " Hundred";
  }
  if (remainder > 0) {
    if (str !== "") str += " ";
    str += convertTwoDigits(remainder);
  }
  return str;
}

/**
 * Converts a numeric amount to Indian Currency words
 * Format: "Rupees [X Lakh Y Thousand Z Hundred] Only" or "Rupees [X] and Paise [Y] Only"
 */
export function numberToWordsIndian(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return "Rupees Zero Only";
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  if (rupees === 0 && paise > 0) {
    return `${isNegative ? "Minus " : ""}Paise ${convertTwoDigits(paise)} Only`;
  }

  let words = "";

  // Indian System Breakdown:
  // Crores (1,00,00,000)
  // Lakhs (1,00,000)
  // Thousands (1,000)
  // Hundreds (100)

  const crore = Math.floor(rupees / 10000000);
  const croreRemainder = rupees % 10000000;

  const lakh = Math.floor(croreRemainder / 100000);
  const lakhRemainder = croreRemainder % 100000;

  const thousand = Math.floor(lakhRemainder / 1000);
  const thousandRemainder = lakhRemainder % 1000;

  const remainder = thousandRemainder;

  if (crore > 0) {
    words += (words ? " " : "") + convertTwoDigits(crore) + " Crore";
  }
  if (lakh > 0) {
    words += (words ? " " : "") + convertTwoDigits(lakh) + " Lakh";
  }
  if (thousand > 0) {
    words += (words ? " " : "") + convertTwoDigits(thousand) + " Thousand";
  }
  if (remainder > 0) {
    const remWords = convertThreeDigits(remainder);
    if (remWords) {
      words += (words ? " " : "") + remWords;
    }
  }

  let result = "Rupees " + (words.trim() || "Zero");

  if (paise > 0) {
    result += " and Paise " + convertTwoDigits(paise);
  }

  result += " Only";
  return (isNegative ? "Minus " : "") + result;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
}
