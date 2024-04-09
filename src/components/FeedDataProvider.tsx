import { PropsWithChildren, useCallback } from "react"

import {
  FeedAction,
  FeedData,
  FeedDataContext,
  FeedDataDispatchContext,
  RuleWithMetadata,
  initialFeedData,
} from "@app/hooks/feedData"
import useLocalStorage from "@app/hooks/localStorage"
import collections from "@app/utils/collections"
import { LocalStorageKeys } from "@app/utils/defaults"
import { Rule } from "@app/utils/rules"

export const FeedDataProvider = ({ children }: PropsWithChildren<object>) => {
  const [storedFeedData, setStoredFeedData] = useLocalStorage(
    LocalStorageKeys.feedData,
    initialFeedData
  )

  const storedFeedDataDispatch = useCallback(
    (action: FeedAction) => {
      const newFeed = feedDataReducer(storedFeedData, action)
      setStoredFeedData(newFeed)
    },
    [storedFeedData, setStoredFeedData]
  )

  return (
    <FeedDataContext.Provider value={storedFeedData}>
      <FeedDataDispatchContext.Provider value={storedFeedDataDispatch}>
        {children}
      </FeedDataDispatchContext.Provider>
    </FeedDataContext.Provider>
  )
}

function feedDataReducer(feedData: FeedData, action: FeedAction): FeedData {
  const ids = feedData.rules.map((r) => r.id)
  let nextId = ids.length === 0 ? 1 : collections.max(ids) + 1

  const giveMetadata = (rule: Rule): RuleWithMetadata => ({
    name: `Rule ${nextId}`,
    id: nextId++,
    rule,
  })

  switch (action.type) {
    case "add":
      return {
        ...feedData,
        rules: [...feedData.rules, giveMetadata(action.rule)],
      }
    case "delete":
      return {
        ...feedData,
        rules: feedData.rules.filter((rule) => rule.id !== action.ruleId),
      }
    case "setUrl":
      return { ...feedData, feedUrl: action.feedUrl }
    case "replace":
      return {
        ...feedData,
        rules: feedData.rules.map((rule) =>
          rule.id === action.ruleId ? { ...rule, rule: action.rule } : rule
        ),
      }
    case "shiftUp":
      return {
        ...feedData,
        rules: collections.shiftItemLeft(
          feedData.rules,
          (r) => r.id === action.ruleId
        ),
      }
    case "shiftDown":
      return {
        ...feedData,
        rules: collections.shiftItemRight(
          feedData.rules,
          (r) => r.id === action.ruleId
        ),
      }
    case "rawReplace":
      return {
        ...feedData,
        rules: feedData.rules.map((rule) =>
          rule.id === action.ruleId ? action.rule : rule
        ),
      }
    case "clear":
      return { feedUrl: feedData.feedUrl, rules: initialFeedData.rules }
    case "set":
      return {
        feedUrl: action.feedUrl,
        rules: action.rules.map(giveMetadata),
      }
  }
}
