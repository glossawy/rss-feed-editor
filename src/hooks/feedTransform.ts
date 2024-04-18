import { createContext, useContext } from "react"

import useLocalStorage from "@app/hooks/localStorage"
import { LocalStorageKeys } from "@app/utils/defaults"
import migrate from "@app/utils/migration"
import { FeedTransform, Rule } from "@app/utils/rules"

export type RuleWithoutMetadata = Omit<Rule, "rid" | "name"> & {
  name?: Rule["name"]
}

export type RuleId = Rule["rid"]

export type FeedAction =
  | { type: "setUrl"; feedUrl: string }
  | { type: "set"; feedUrl: string; rules: RuleWithoutMetadata[] }
  | { type: "add"; rule: RuleWithoutMetadata }
  | { type: "delete"; ruleId: RuleId }
  | { type: "rawReplace"; ruleId: RuleId; rule: Rule }
  | { type: "replace"; ruleId: RuleId; rule: RuleWithoutMetadata }
  | { type: "shiftUp"; ruleId: RuleId }
  | { type: "shiftDown"; ruleId: RuleId }
  | { type: "clear" }

export const exampleTransform: FeedTransform = {
  version: 1,
  feed_url: "https://www.rssboard.org/files/sample-rss-2.xml",
  rules: [
    {
      rid: "3fd34096-3ad8-410f-8080-972c5045b713",
      name: "Remove NASA + Space Station Articles",
      condition: {
        all_of: [
          {
            args: {
              pattern: "NASA",
            },
            name: "contains",
            xpath: "title",
          },
          {
            args: {
              pattern: "Space Station",
            },
            name: "contains",
            xpath: "title",
          },
        ],
      },
      mutations: [
        {
          args: {},
          name: "remove",
        },
      ],
      xpath: "//channel/item",
    },
    {
      rid: "71850834-5d40-4cf8-8e9b-3c598082b19e",
      name: "Change NASA to ROSCOM",
      condition: {
        args: {
          pattern: "NASA",
        },
        name: "contains",
        xpath: "title",
      },
      mutations: [
        {
          args: {
            pattern: "NASA",
            replacement: "ROSCOM",
            trim: false,
          },
          name: "replace",
          xpath: "title",
        },
      ],
      xpath: "//channel/item",
    },
  ],
}

export const FeedTransformContext = createContext<FeedTransform>({
  ...exampleTransform,
})
export const FeedTransformDispatchContext = createContext<
  React.Dispatch<FeedAction>
>(() => {})

export const useFeedTransform = () => useContext(FeedTransformContext)
export const useFeedTransformDispatch = () =>
  useContext(FeedTransformDispatchContext)

export function useStoredFeedTransform(
  initial: FeedTransform
): [FeedTransform, (newValue: FeedTransform) => void] {
  const [storedFeedTransform, setStoredFeedTransform] = useLocalStorage(
    LocalStorageKeys.feedTransform,
    initial
  )

  return [migrate(storedFeedTransform), setStoredFeedTransform]
}
