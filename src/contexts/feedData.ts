import { createContext, useContext } from "react"

import { Rule } from "@app/utils/rules"
import { DefaultFactories } from "@app/utils/defaults"

export type FeedAction =
  | { type: "setUrl"; feedUrl: string }
  | { type: "add"; rule: Rule }
  | { type: "delete"; ruleId: number }
  | { type: "rawReplace"; ruleId: number; rule: RuleWithMetadata }
  | { type: "replace"; ruleId: number; rule: Rule }
  | { type: "shiftUp"; ruleId: number }
  | { type: "shiftDown"; ruleId: number }

export type RuleWithMetadata = {
  id: number
  name: string
  rule: Rule
}

export type FeedData = {
  feedUrl: string
  rules: RuleWithMetadata[]
}

export const initialFeedData: FeedData = {
  feedUrl: "https://www.rssboard.org/files/sample-rss-2.xml",
  rules: [
    {
      id: 1,
      name: "Rule 1",
      rule: DefaultFactories.rule(),
    },
    {
      id: 2,
      name: "Rule 2",
      rule: DefaultFactories.rule(),
    },
    {
      id: 3,
      name: "Rule 3",
      rule: {
        xpath: "//channel/item",
        condition: DefaultFactories.condition(),
        mutations: [
          DefaultFactories.mutation(),
          {
            name: "changeTag",
            args: {
              tag: "test",
            },
          },
        ],
      },
    },
  ],
}

export const FeedDataContext = createContext<FeedData>({ ...initialFeedData })
export const FeedDataDispatchContext = createContext<
  React.Dispatch<FeedAction>
>(() => {})

export const useFeedData = () => useContext(FeedDataContext)
export const useFeedDataDispatch = () => useContext(FeedDataDispatchContext)
