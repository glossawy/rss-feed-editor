import { useEffect, useState } from "react"
import Diff from "./Diff"

import * as api from "../utils/api"

type Props = {
  feedUrl: string | null
  encodedRules: string | null
}

export default function FeedDiff({ feedUrl, encodedRules }: Props) {
  const [sourceFeedContent, setSourceFeedContent] = useState<string | null>(
    null
  )
  const [transformedFeedContent, setTransformedFeedContent] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const asyncOp = async () => {
      if (!feedUrl || !encodedRules) return

      const sourceFeed = await api.proxyUrl(feedUrl)
      const transformedFeed = await api.getTransformedFeed(encodedRules)

      setIsLoading(false)
      setSourceFeedContent(sourceFeed)
      setTransformedFeedContent(transformedFeed)
    }

    asyncOp()
  }, [feedUrl, encodedRules])

  const title = isLoading ? "Loading..." : feedUrl
  const left = sourceFeedContent || ""
  const right = transformedFeedContent || ""

  return (
    <Diff
      title={title || "No Feed Provided"}
      left={left}
      right={right}
      config={{
        fileListStartVisible: false,
        fileListToggle: false,
        fileContentToggle: false,
        drawFileList: false,
      }}
    />
  )
}
