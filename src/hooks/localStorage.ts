import { useCallback, useSyncExternalStore } from "react"

import { LocalStorageKeys } from "@app/utils/defaults"

type StorableValue = string | number | boolean | null
type StorableObject = Record<string, StorableValue>

export type Storable =
  | StorableValue
  | StorableObject
  | Storable[]
  | { [key: string]: Storable }

type KeyValue = (typeof LocalStorageKeys)[keyof typeof LocalStorageKeys]

type UpdateEventPayload = {
  key: string
}

export class StorageUpdateEvent extends CustomEvent<UpdateEventPayload> {
  static type: keyof WindowEventMap = "rsseditor:storage-update" as const

  constructor(payload: UpdateEventPayload) {
    super(StorageUpdateEvent.type, { detail: payload })
  }
}

export default function useLocalStorage<T extends Storable>(
  key: KeyValue,
  initialValue: T
): [T, (newValue: T) => void] {
  const currentStoredItem = useSyncExternalStore(
    (callback) => {
      const listener = (evt: StorageUpdateEvent) => {
        if (evt.detail.key === key) callback()
      }

      window.addEventListener("rsseditor:storage-update", listener)
      return () => {
        window.removeEventListener("rsseditor:storage-update", listener)
      }
    },
    () => localStorage.getItem(key)
  )

  const setStoredValue = useCallback(
    (value: T) => {
      localStorage.setItem(key, JSON.stringify(value))
      window.dispatchEvent(new StorageUpdateEvent({ key }))
    },
    [key]
  )

  const value: T = currentStoredItem
    ? JSON.parse(currentStoredItem)
    : initialValue

  return [value, setStoredValue]
}
