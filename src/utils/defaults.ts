import { Condition, Mutation, Rule, nextRuleId } from "@app/utils/rules"

export const LocalStorageKeys = {
  colorMode: "color-mode", // change with caution, used in index.html
  feedTransform: "feed-data:v1",
} as const

export const DefaultFactories = {
  mutations: {
    remove(): Mutation {
      return {
        name: "remove",
        args: {},
      }
    },
    changeTag(): Mutation {
      return {
        name: "changeTag",
        args: {
          tag: "",
        },
      }
    },
    replace(): Mutation {
      return {
        name: "replace",
        args: {
          pattern: "",
          replacement: "",
          trim: false,
        },
      }
    },
  },
  conditions: {
    contains(): Condition {
      return {
        name: "contains",
        args: { pattern: ".+?" },
      }
    },
    allOf(): Condition {
      return { all_of: [] }
    },
    anyOf(): Condition {
      return { any_of: [] }
    },
  },
  mutation(): Mutation {
    return this.mutations.remove()
  },
  condition(): Condition {
    return this.conditions.contains()
  },
  rule(): Rule {
    const id = nextRuleId()
    return {
      rid: id,
      name: `Rule ${id}`,
      xpath: "//channel/item",
      condition: DefaultFactories.condition(),
      mutations: [DefaultFactories.mutation()],
    }
  },
}
