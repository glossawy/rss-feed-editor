import * as Icons from "@mui/icons-material"
import { Box, IconButton } from "@mui/joy"
import { useCallback } from "react"

import useClipboard from "@app/hooks/clipboard"
import { useFeedDataDispatch } from "@app/hooks/feedData"
import { decodeRules, extractFromRewriteUrl } from "@app/utils/api"

export default function FeedDataImportButton() {
  const clipboard = useClipboard()
  const dispatch = useFeedDataDispatch()

  const onClick = useCallback(async () => {
    const clipboardText = await clipboard.read()

    if (clipboardText == null) {
      console.warn(
        `Nothing in clipboard to import or invalid format: ${clipboardText}`
      )
      return
    }

    const encodedValue = extractFromRewriteUrl(clipboardText)

    if (encodedValue == null) {
      console.warn(`No encoded value found in url: ${clipboardText}`)
      return
    }

    const transform = await decodeRules(decodeURIComponent(encodedValue))

    dispatch({
      type: "set",
      feedUrl: transform.feed_url,
      rules: transform.rules,
    })
  }, [clipboard, dispatch])

  return (
    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "end" }}>
      <div>
        <IconButton
          onClick={onClick}
          size="lg"
          title={`Import rules using feed URL in clipboard`}
        >
          <Icons.Upload />
        </IconButton>
      </div>
    </Box>
  )
}
