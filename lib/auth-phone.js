// Match the existing backend's national-number and E.164 limits.
export function mobileLimits(countryCode) {
  const codeLength = countryCode.replace(/\D/g, '').length
  return countryCode === '+91' ? { min: 10, max: 10 } : { min: Math.max(6, 8 - codeLength), max: 15 - codeLength }
}

export function cleanMobile(value, countryCode) {
  const text = String(value || '')
  const code = countryCode.replace(/\D/g, '')
  const { max } = mobileLimits(countryCode)
  let digits = text.replace(/[^0-9]/g, '')
  if ((text.trim().startsWith('+') || digits.length > max) && digits.startsWith(code)) digits = digits.slice(code.length)
  if (countryCode === '+91' && digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, max)
}

export function validMobile(value, countryCode) {
  const { min, max } = mobileLimits(countryCode)
  return /^[0-9]+$/.test(value) && value.length >= min && value.length <= max
}

export const mobileError = countryCode => countryCode === '+91' ? 'Enter a 10-digit mobile number.' : 'Enter a valid mobile number for the selected country code.'
