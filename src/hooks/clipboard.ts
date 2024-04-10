import { useCallback } from "react"

import usePermission from "./permission"

const MIME_TYPE = "text/plain"

function writeText(value: string) {
  const blob = new Blob([value], { type: MIME_TYPE })
  const item = new ClipboardItem({ [MIME_TYPE]: blob })
  return navigator.clipboard.write([item])
}

export default function useClipboard() {
  const writeAllowed = usePermission("copy", {
    defaultValue: isSecureContext || false,
  })

  const writeToClipboard = useCallback(
    (value: string) => {
      if (writeAllowed) {
        writeText(value)
      }
    },
    [writeAllowed]
  )

  return {
    writeAllowed,
    write: writeToClipboard,
  }
}
