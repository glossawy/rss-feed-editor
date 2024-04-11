import { PropsWithChildren, useCallback } from "react"

import {
  FeedAction,
  FeedTransformContext,
  FeedTransformDispatchContext,
  RuleWithoutMetadata,
  exampleTransform as initialFeedTransform,
  useStoredFeedTransform,
} from "@app/hooks/feedTransform"
import collections from "@app/utils/collections"
import { FeedTransform, Rule, nextRuleId } from "@app/utils/rules"

export const FeedTransformProvider = ({
  children,
}: PropsWithChildren<object>) => {
  const [storedFeedTransform, setStoredTransform] =
    useStoredFeedTransform(initialFeedTransform)

  const storedFeedDataDispatch = useCallback(
    (action: FeedAction) => {
      const newFeed = feedTransformReducer(storedFeedTransform, action)
      setStoredTransform(newFeed)
    },
    [storedFeedTransform, setStoredTransform]
  )

  return (
    <FeedTransformContext.Provider value={storedFeedTransform}>
      <FeedTransformDispatchContext.Provider value={storedFeedDataDispatch}>
        {children}
      </FeedTransformDispatchContext.Provider>
    </FeedTransformContext.Provider>
  )
}

function feedTransformReducer(
  feedTransform: FeedTransform,
  action: FeedAction
): FeedTransform {
  const giveMetadata = (rule: RuleWithoutMetadata): Rule => {
    const rid = nextRuleId()
    return {
      rid,
      name: `A new rule`,
      ...rule,
    }
  }

  switch (action.type) {
    case "add":
      return {
        ...feedTransform,
        rules: [...feedTransform.rules, giveMetadata(action.rule)],
      }
    case "delete":
      return {
        ...feedTransform,
        rules: feedTransform.rules.filter((rule) => rule.rid !== action.ruleId),
      }
    case "setUrl":
      return { ...feedTransform, feed_url: action.feedUrl }
    case "replace":
      return {
        ...feedTransform,
        rules: feedTransform.rules.map((rule) =>
          rule.rid === action.ruleId ? { ...rule, ...action.rule } : rule
        ),
      }
    case "shiftUp":
      return {
        ...feedTransform,
        rules: collections.shiftItemLeft(
          feedTransform.rules,
          (r) => r.rid === action.ruleId
        ),
      }
    case "shiftDown":
      return {
        ...feedTransform,
        rules: collections.shiftItemRight(
          feedTransform.rules,
          (r) => r.rid === action.ruleId
        ),
      }
    case "rawReplace":
      return {
        ...feedTransform,
        rules: feedTransform.rules.map((rule) =>
          rule.rid === action.ruleId ? action.rule : rule
        ),
      }
    case "clear":
      return { ...feedTransform, rules: initialFeedTransform.rules }
    case "set":
      return {
        ...feedTransform,
        feed_url: action.feedUrl,
        rules: action.rules.map(giveMetadata),
      }
  }
}
