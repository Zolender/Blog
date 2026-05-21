import { useState } from 'react'

interface FloatingInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  autoComplete?: string
}

const FloatingInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
}: FloatingInputProps) => {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete={autoComplete}
        placeholder=""
        className="
          w-full bg-white border border-border
          px-4 pt-6 pb-2
          font-sans text-sm text-primary
          outline-none transition-colors duration-200
          focus:border-accent
        "
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 font-sans pointer-events-none
          transition-all duration-200
          ${lifted
            ? 'top-1.5 fine-text text-accent'
            : 'top-1/2 -translate-y-1/2 text-sm text-muted'
          }
        `}
      >
        {label}
      </label>
    </div>
  )
}

export default FloatingInput