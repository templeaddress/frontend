'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './Template.module.css'

export default function OtpInput({ value, onChange, label = '6-digit OTP', hint, disabled = false }) {
  const [digits, setDigits] = useState(() => Array.from({ length: 6 }, (_, index) => value[index] || ''))
  const inputs = useRef([])
  useEffect(() => {
    setDigits(previous => previous.join('') === value ? previous : Array.from({ length: 6 }, (_, index) => value[index] || ''))
  }, [value])

  function update(index, text) {
    const clean = text.replace(/\D/g, '').slice(0, 6 - index)
    const next = Array.from({ length: 6 }, (_, position) => digits[position] || '')
    if (!clean) next[index] = ''
    else [...clean].forEach((digit, offset) => { next[index + offset] = digit })
    setDigits(next)
    onChange(next.join(''))
    if (clean) inputs.current[Math.min(index + clean.length, 5)]?.focus()
  }

  return <fieldset className={styles.otpGroup} disabled={disabled}>
    <legend>{label}</legend>
    <div className={styles.otpRow}>{Array.from({ length: 6 }, (_, index) => <input
      key={index} ref={element => { inputs.current[index] = element }} className={styles.otpInput}
      aria-label={`OTP digit ${index + 1}`} autoFocus={index === 0} inputMode="numeric"
      autoComplete={index === 0 ? 'one-time-code' : 'off'} pattern="[0-9]" maxLength={6}
      value={digits[index] || ''} required onFocus={event => event.target.select()}
      onChange={event => update(index, event.target.value)}
      onPaste={event => { event.preventDefault(); update(index, event.clipboardData.getData('text')) }}
      onKeyDown={event => {
        if (/^[0-9]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); update(index, event.key) }
        if (event.key === 'Backspace' && !digits[index] && index > 0) { event.preventDefault(); update(index - 1, ''); inputs.current[index - 1]?.focus() }
        if (event.key === 'ArrowLeft') { event.preventDefault(); inputs.current[Math.max(0, index - 1)]?.focus() }
        if (event.key === 'ArrowRight') { event.preventDefault(); inputs.current[Math.min(5, index + 1)]?.focus() }
      }}/>)}</div>
    {hint && <p className={`${styles.hint} mt-3`}>{hint}</p>}
  </fieldset>
}
