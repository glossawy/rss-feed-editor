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

  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [isLoadingTransformed, setIsLoadingTransformed] = useState(false)

  const isLoading = isLoadingSource || isLoadingTransformed

  useEffect(() => {
    if (!feedUrl) return

    setIsLoadingSource(true)
    api
      .proxyUrl(feedUrl)
      .then(setSourceFeedContent)
      .finally(() => {
        setIsLoadingSource(false)
      })
  }, [feedUrl])

  useEffect(() => {
    if (!encodedRules) return

    setIsLoadingTransformed(true)
    api
      .getTransformedFeed(encodedRules)
      .then(setTransformedFeedContent)
      .finally(() => {
        setIsLoadingTransformed(false)
      })
  }, [encodedRules])

  const title = isLoading ? "Loading..." : feedUrl
  const left = isLoading ? "" : sourceFeedContent || ""
  const right = isLoading ? "" : transformedFeedContent || ""

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
