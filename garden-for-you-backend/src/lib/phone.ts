const BY_MOBILE_CODES = ["29", "33", "44", "25"]

// Normalizes a Belarusian phone number to the canonical +375XXXXXXXXX form.
// Accepts +375XXXXXXXXX, 80XXXXXXXXX or the 9-digit national form.
// Returns null if the number is not a valid BY mobile number.
export function normalizeByPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  let national: string | null = null

  if (digits.length === 12 && digits.startsWith("375")) {
    national = digits.slice(3)
  } else if (digits.length === 11 && digits.startsWith("80")) {
    national = digits.slice(2)
  } else if (digits.length === 9) {
    national = digits
  }

  if (national && BY_MOBILE_CODES.includes(national.slice(0, 2))) {
    return `+375${national}`
  }

  return null
}
