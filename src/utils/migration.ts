import { exampleTransform } from "@app/hooks/feedTransform"
import { FeedTransform, Rule } from "@app/utils/rules"

type RuleWithoutMetadata = {
  id: number
  name: string
  rule: Omit<Rule, "rid" | "name">
}
type UnversionedFeedTransform = Omit<
  FeedTransform,
  "feed_url" | "version" | "rules"
> & {
  feedUrl: string
  rules: RuleWithoutMetadata[]
}

export default function migrate(
  feedTransform: UnversionedFeedTransform | FeedTransform
): FeedTransform {
  // Move unversioned feed transforms up to V1
  if (!("version" in feedTransform)) {
    feedTransform = exampleTransform
  }

  if ("version" in feedTransform && feedTransform["version"] >= 1) {
    return feedTransform
  } else {
    throw new Error(
      `Encountered unexpected feed transform version: ${feedTransform.version}`
    )
  }
}
