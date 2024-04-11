import { createContext, useContext, useEffect } from "react"

import useLocalStorage from "@app/hooks/localStorage"
import { DefaultFactories, LocalStorageKeys } from "@app/utils/defaults"
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

export const initialFeedData: FeedTransform = {
  version: 1,
  feed_url: "https://www.rssboard.org/files/sample-rss-2.xml",
  rules: [
    DefaultFactories.rule(),
    DefaultFactories.rule(),
    {
      rid: "3",
      name: "Rule 3",
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
  ],
}

export const FeedTransformContext = createContext<FeedTransform>({
  ...initialFeedData,
})
export const FeedTransformDispatchContext = createContext<
  React.Dispatch<FeedAction>
>(() => {})

export const useFeedTransform = () => useContext(FeedTransformContext)
export const useFeedTransformDispatch = () =>
  useContext(FeedTransformDispatchContext)

export const useStoredFeedTransform = (
  initial: FeedTransform
): [FeedTransform, React.Dispatch<React.SetStateAction<FeedTransform>>] => {
  const [storedFeedTransform, setStoredFeedTransform] = useLocalStorage(
    LocalStorageKeys.feedTransform,
    initial
  )

  // Runs migrations if needed exactly once on mount
  useEffect(() => {
    setStoredFeedTransform(migrate(storedFeedTransform))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return [migrate(storedFeedTransform), setStoredFeedTransform]
}
