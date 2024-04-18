import { StorageUpdateEvent } from "@app/hooks/localStorage"

declare global {
  interface WindowEventMap {
    "rsseditor:storage-update": StorageUpdateEvent
  }
}

export {}
