import type { Condition, Mutation, Rule, FeedTransform } from "./rules"

type BaseParams = { xpath?: string }

type ContainsParams = BaseParams & { value: string }

function trimXPath<T extends Condition | Mutation>(obj: T): T {
  if ("xpath" in obj && obj.xpath == undefined) delete obj["xpath"]

  return obj
}

export const Conditions = {
  contains({ xpath, value }: ContainsParams): Condition {
    return trimXPath({
      xpath,
      name: "contains",
      args: {
        value,
      },
    })
  },
  anyOf(conditions: [Condition]): Condition {
    return { any_of: conditions }
  },
  allOf(conditions: [Condition]): Condition {
    return { all_of: conditions }
  },
}

export const Mutations = {
  remove({ xpath }: BaseParams): Mutation {
    return trimXPath({
      xpath,
      name: "remove",
      args: {},
    })
  },
}

export const FeedTransforms = {
  empty(): FeedTransform {
    return { feed_url: "", rules: [] }
  },
  initial(feedUrl: string): FeedTransform {
    return {
      feed_url: feedUrl,
      rules: [],
    }
  },
  fromRules(feedUrl: string, rules: [Rule]): FeedTransform {
    return {
      feed_url: feedUrl,
      rules,
    }
  },
}
