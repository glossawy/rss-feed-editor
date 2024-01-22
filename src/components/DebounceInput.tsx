import { Input, InputProps } from "@mui/joy"
import { useCallback, useRef, useState } from "react"

type Props = { debounceTimeout?: number } & InputProps

export default function DebouncedInput(props: Props) {
  const { onChange, debounceTimeout, ...inputProps } = props
  const [value, setValue] = useState(props.value)

  const timeout = debounceTimeout || 1_000
  const timer = useRef<number>()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)

      if (timer.current) clearTimeout(timer.current)

      timer.current = setTimeout(() => {
        onChange && onChange(e)
      }, timeout)
    },
    [timeout, timer, onChange]
  )

  return <Input {...inputProps} value={value} onChange={handleChange} />
}
