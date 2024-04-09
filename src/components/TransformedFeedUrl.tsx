import * as Icons from "@mui/icons-material"
import { IconButton, Input } from "@mui/joy"

import useClipboard from "@app/hooks/clipboard"
import { toRewriteUrl, useEncodedRules } from "@app/utils/api"
import { isBlank } from "@app/utils/strings"

function EmptyDecorator() {
  return <Icons.WarningAmberRounded titleAccess="No valid rules yet" />
}

export default function TransformedFeedUrl() {
  const encodedRules = useEncodedRules()
  const rewriteUrl = toRewriteUrl(encodedRules ?? "")

  const clipboard = useClipboard()

  return (
    <div>
      <Input
        value={rewriteUrl}
        type="url"
        disabled={isBlank(encodedRules)}
        contentEditable={false}
        onFocus={(evt) => evt.target.select()}
        startDecorator={
          isBlank(encodedRules) ? (
            <EmptyDecorator />
          ) : (
            <>
              <IconButton onClick={() => clipboard.write(rewriteUrl)}>
                <Icons.CopyAll />
              </IconButton>
            </>
          )
        }
      />
    </div>
  )
}
