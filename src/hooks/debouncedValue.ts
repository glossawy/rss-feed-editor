import { useCallback, useEffect, useRef, useState } from "react"

export function useDebouncedValue<T>(value: T, wait: number) {
  const [internalValue, setInternalValue] = useState(value)
  const isMountedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])
  console.log("debounced")

  useEffect(() => {
    if (!isMountedRef.current) return

    cancel()

    timeoutRef.current = setTimeout(() => {
      setInternalValue(value)
    }, wait)
  }, [cancel, value, wait])

  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return [internalValue, cancel] as const
}
