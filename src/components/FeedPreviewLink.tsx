import { Link, Typography } from "@mui/joy"

import { toRewriteUrl, useEncodedRules } from "@app/utils/api"
import { isBlank } from "@app/utils/strings"

export default function FeedPreviewLink() {
  const encodedRules = useEncodedRules()
  const rewriteUrl = toRewriteUrl(encodedRules ?? "")

  return isBlank(encodedRules) ? (
    <Typography>No valid rules yet</Typography>
  ) : (
    <div>
      <Link href={rewriteUrl}>Link to Transformed Feed</Link>
    </div>
  )
}
