import {
  FeedAction,
  FeedData,
  FeedDataContext,
  FeedDataDispatchContext,
  RuleWithMetadata,
  initialFeedData,
} from "../contexts/feedData"
import collections from "../utils/collections"
import { Rule } from "../utils/rules"
import { PropsWithChildren, useReducer } from "react"

export const FeedDataProvider = ({ children }: PropsWithChildren<object>) => {
  const [feedData, feedDataDispatch] = useReducer(
    feedDataReducer,
    initialFeedData
  )

  return (
    <FeedDataContext.Provider value={feedData}>
      <FeedDataDispatchContext.Provider value={feedDataDispatch}>
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
  }
}
