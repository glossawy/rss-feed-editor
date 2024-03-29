import { Condition, Mutation, Rule } from "./rules"

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
        args: { value: "" },
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
    return {
      xpath: "//channel/item",
      condition: DefaultFactories.condition(),
      mutations: [DefaultFactories.mutation()],
    }
  },
}
