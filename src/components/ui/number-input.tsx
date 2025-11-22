import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface NumberInputProps
  extends Omit<NumericFormatProps, 'value' | 'onValueChange'> {
  stepper?: number
  thousandSeparator?: string
  placeholder?: string
  defaultValue?: number
  min?: number
  max?: number
  value?: number // Controlled value
  suffix?: string
  prefix?: string
  onValueChange?: (value: number | undefined) => void
  fixedDecimalScale?: boolean
  decimalScale?: number
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | undefined>(
      controlledValue ?? defaultValue,
    )

    const handleIncrement = useCallback(() => {
      const prev = value
      const next =
        prev === undefined
          ? (stepper ?? 1)
          : Math.min(prev + (stepper ?? 1), max)
      setValue(next)
      onValueChange?.(next)
    }, [stepper, max, value, onValueChange])

    const handleDecrement = useCallback(() => {
      const prev = value
      const next =
        prev === undefined
          ? -(stepper ?? 1)
          : Math.max(prev - (stepper ?? 1), min)
      setValue(next)
      onValueChange?.(next)
    }, [stepper, min, value, onValueChange])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          handleIncrement()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          handleDecrement()
        }
      },
      [handleIncrement, handleDecrement],
    )

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue)
      }
    }, [controlledValue])

    const handleChange = (values: {
      value: string
      floatValue: number | undefined
    }) => {
      const newValue =
        values.floatValue === undefined ? undefined : values.floatValue
      setValue(newValue)
      if (onValueChange) {
        onValueChange(newValue)
      }
    }

    const handleBlur = () => {
      if (value !== undefined) {
        if (value < min) {
          setValue(min)
          if (ref && 'current' in ref && ref.current) {
            ref.current.value = String(min)
          }
        } else if (value > max) {
          setValue(max)
          if (ref && 'current' in ref && ref.current) {
            ref.current.value = String(max)
          }
        }
      }
    }

    return (
      <div className="flex items-center">
        {/* Mobile: - button on left */}
        <Button
          aria-label="Decrease value"
          className="border-input h-8 rounded-l-md rounded-r-none border-r-0 md:hidden"
          variant="outline"
          onClick={handleDecrement}
          disabled={value === min}
        >
          <Minus className="size-4" />
        </Button>
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="relative h-8 w-13 shrink-0 [appearance:textfield] rounded-none md:rounded-l-md md:rounded-r-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          getInputRef={ref}
          {...props}
        />
        {/* Mobile: + button on right */}
        <Button
          aria-label="Increase value"
          className="border-input h-8 rounded-l-none rounded-r-md border-l-0 md:hidden"
          variant="outline"
          onClick={handleIncrement}
          disabled={value === max}
        >
          <Plus className="size-4" />
        </Button>
        {/* Desktop: chevron buttons on right */}
        <div className="hidden flex-col md:flex">
          <Button
            aria-label="Increase value"
            className="border-input h-4 rounded-l-none rounded-br-none border-b-[0.5px] border-l-0 py-0 focus-visible:relative has-[>svg]:px-3"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            aria-label="Decrease value"
            className="border-input h-4 rounded-l-none rounded-tr-none border-t-[0.5px] border-l-0 py-0 focus-visible:relative has-[>svg]:px-3"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
          >
            <ChevronDown className="size-3" />
          </Button>
        </div>
      </div>
    )
  },
)

NumberInput.displayName = 'NumberInput'
