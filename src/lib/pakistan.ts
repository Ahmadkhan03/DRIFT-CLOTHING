export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Jammu & Kashmir",
] as const;

export const CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Sukkur",
  "Gujrat",
  "Sahiwal",
  "Mardan",
  "Rahim Yar Khan",
  "Sheikhupura",
];

/**
 * Normalises Pakistani mobile numbers to 03XXXXXXXXX.
 * Accepts "+92 300 1234567", "923001234567", "0300-1234567", etc.
 * Returns null if it isn't a valid mobile number.
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(4);
  if (digits.startsWith("92") && digits.length === 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("3")) digits = `0${digits}`;
  return /^03\d{9}$/.test(digits) ? digits : null;
}
