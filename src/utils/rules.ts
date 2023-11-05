type ConditionBase = { xpath?: string }

export type Condition =
  | { all_of: [Condition] }
  | { any_of: [Condition] }
  | (ConditionBase & { name: "contains"; args: { value: string } })

const conditionSchema = {
  oneOf: [
    // AllOf condition (AND)
    {
      type: "object",
      properties: {
        all_of: {
          type: "array",
          items: {
            $ref: "#/$defs/condition",
          },
        },
      },
      additionalProperties: false,
    },
    // AnyOf Condition (OR)
    {
      type: "object",
      properties: {
        any_of: {
          type: "array",
          items: {
            $ref: "#/$defs/condition",
          },
        },
      },
      additionalProperties: false,
    },
    // Actual Condition
    {
      type: "object",
      properties: {
        xpath: {
          type: "string",
          nullable: true,
        },
        name: {
          type: "string",
          nullable: false,
        },
        args: {
          type: "object",
          additionalProperties: true,
        },
      },
      required: ["name", "args"],
      additionalProperties: false,
    },
  ],
}

type MutationBase = { xpath?: string }
export type Mutation = MutationBase & {
  name: "remove"
  args: Record<string, never>
}

const mutationSchema = {
  type: "object",
  properties: {
    xpath: {
      type: "string",
      nullable: true,
    },
    name: {
      type: "string",
      nullable: false,
    },
    args: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: ["name", "args"],
  additionalProperties: false,
}

export type Rule = {
  xpath: string
  condition: Condition | Record<string, never>
  mutations: Array<Mutation>
}

const ruleSchema = {
  type: "object",
  properties: {
    xpath: {
      type: "string",
      nullable: false,
    },
    condition: {
      oneOf: [
        {
          $ref: "#/$defs/condition",
        },
        {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      ],
    },
    mutations: {
      type: "array",
      items: {
        $ref: "#/$defs/mutation",
      },
    },
  },
  additionalProperties: false,
  required: ["xpath", "condition", "mutations"],
}

export type FeedTransform = {
  feed_url: string
  rules: Array<Rule>
}

export const feedTransformSchema = {
  type: "object",
  properties: {
    feed_url: {
      type: "string",
      nullable: false,
    },
    rules: {
      type: "array",
      items: {
        $ref: "#/$defs/rule",
      },
    },
  },
  required: ["feed_url", "rules"],
  additionalProperties: false,
  $defs: {
    rule: ruleSchema,
    condition: conditionSchema,
    mutation: mutationSchema,
  },
}
