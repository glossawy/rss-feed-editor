import { useEffect, useState } from "react"

import { LocalStorageKeys } from "@app/utils/defaults"

type StorableValue = string | number | boolean | null
type StorableObject = Record<string, StorableValue>

export type Storable =
  | StorableValue
  | StorableObject
  | Storable[]
  | { [key: string]: Storable }

function coerce<T extends Storable>(
  value: string,
  { fallback }: { fallback: T }
): T {
  try {
    return JSON.parse(value) as T
  } catch (e) {
    console.error(e)
    return fallback
  }
}

type KeyValue = (typeof LocalStorageKeys)[keyof typeof LocalStorageKeys]

export default function useLocalStorage<T extends Storable>(
  key: KeyValue,
  initialValue: T
): [T, (val: T) => void] {
  const [value, setValue] = useState(() => {
    if (!window.localStorage) return initialValue

    const currentValue = localStorage.getItem(key)
    return currentValue
      ? coerce<T>(currentValue, { fallback: initialValue })
      : initialValue
  })

  useEffect(() => {
    if (window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])

  return [value, setValue]
}
