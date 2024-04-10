import { useCallback } from "react"

import usePermission from "./permission"

const MIME_TYPE = "text/plain"

function writeText(value: string) {
  const blob = new Blob([value], { type: MIME_TYPE })
  const item = new ClipboardItem({ [MIME_TYPE]: blob })
  return navigator.clipboard.write([item])
}

async function readText() {
  console.log("Reading")
  const clipboardItems = await navigator.clipboard.read()
  console.log(clipboardItems)
  const clipboardItem = clipboardItems[0]
  console.log(clipboardItem)
  const blob = await clipboardItem.getType(MIME_TYPE)

  if (blob) return await blob.text()
}

export default function useClipboard() {
  const writeAllowed = usePermission("copy", {
    defaultValue: isSecureContext || false,
  })
  const readAllowed = usePermission("paste", {
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

  const readFromClipboard = useCallback(async () => {
    if (readAllowed) {
      return await readText()
    }
  }, [readAllowed])

  return {
    writeAllowed,
    readAllowed,
    write: writeToClipboard,
    read: readFromClipboard,
  }
}
