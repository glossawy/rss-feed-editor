import { useReducer } from "react"
import {
  Condition,
  FeedTransform,
  Mutation,
  Rule,
  addToCondition,
} from "./utils/rules"
import { FeedTransforms } from "./utils/factories"

export type FeedTransformAction =
  | {
      type: "setUrl"
      url: string
    }
  | {
      type: "replace"
      transform: FeedTransform
    }
  | {
      type: "addRule"
      rule: Rule
    }
  | {
      type: "addCondition"
      ruleIndex: number
      condition: Condition
    }
  | {
      type: "addMutation"
      ruleIndex: number
      mutation: Mutation
    }

export default function useFeedTransform(): [
  FeedTransform,
  React.Dispatch<FeedTransformAction>
] {
  const [feedTransform, dispatch] = useReducer(
    feedTransformReducer,
    FeedTransforms.empty()
  )

  return [feedTransform, dispatch]
}

function feedTransformReducer(
  feedTransform: FeedTransform,
  action: FeedTransformAction
): FeedTransform {
  function updateRule(
    ruleIndex: number,
    transform: (rule: Rule) => Rule
  ): FeedTransform {
    const newRules = [...feedTransform.rules]
    const rule = newRules[ruleIndex]
    newRules[ruleIndex] = transform(rule)

    return { ...feedTransform, rules: newRules }
  }

  switch (action.type) {
    case "setUrl":
      return { ...feedTransform, feed_url: action.url }
    case "addRule":
      return {
        ...feedTransform,
        rules: [...feedTransform.rules, action.rule],
      }
    case "addMutation": {
      return updateRule(action.ruleIndex, (rule) => ({
        ...rule,
        mutations: [...rule.mutations, action.mutation],
      }))
    }
    case "addCondition": {
      return updateRule(action.ruleIndex, (rule) => ({
        ...rule,
        condition: addToCondition(rule.condition, action.condition),
      }))
    }
    case "replace": {
      return action.transform
    }
  }
}
