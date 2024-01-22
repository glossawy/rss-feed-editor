import { z } from "zod"

const emptyObject = (errorMessage: string = "Expected empty object") => {
  return z.custom<Record<string, never>>(
    (data) => {
      console.log(data)

      if (typeof data === "object" && data != null) {
        return Object.keys(data).length === 0
      } else {
        return false
      }
    },
    { fatal: true, message: errorMessage }
  )
}

const XPathBase = z.object({
  xpath: z
    .string()
    .regex(/\S+/, "Relative XPaths must not be blank")
    .optional(),
})

/// CONDITIONS

const ConditionBase = XPathBase

export const ContainsCondition = ConditionBase.extend({
  name: z.literal("contains"),
  args: z.object({
    value: z.string(),
  }),
})

export type SingleCondition = z.infer<typeof ContainsCondition>

export const AllOfCondition: z.ZodType<{ all_of: Condition[] }> = z.object({
  all_of: z.lazy(() => Condition.array()),
})

export const AnyOfCondition: z.ZodType<{ any_of: Condition[] }> = z.object({
  any_of: z.lazy(() => Condition.array()),
})

export const Condition = z.union([
  AllOfCondition,
  AnyOfCondition,
  ContainsCondition,
])
export type Condition = z.infer<typeof Condition>

/// MUTATIONS

const MutationBase = XPathBase

export const RemoveMutation = MutationBase.extend({
  name: z.literal("remove"),
  args: emptyObject("Remove requires no arguments"),
})

export const ReplaceMutation = MutationBase.extend({
  name: z.literal("replace"),
  args: z.object({
    pattern: z.string(),
    replacement: z.string(),
    trim: z.boolean(),
  }),
})

export const ChangeTagMutation = MutationBase.extend({
  name: z.literal("changeTag"),
  args: z.object({
    tag: z.string(),
  }),
})

export const Mutation = z.union([
  RemoveMutation,
  ReplaceMutation,
  ChangeTagMutation,
])
export type Mutation = z.infer<typeof Mutation>

/// RULES / FEED TRANSFORM

export const Rule = z.object({
  xpath: z
    .string()
    .startsWith(
      "/",
      "Rule XPaths must start with '/' or '//', starting with '//channel' is recommended"
    ),
  condition: Condition,
  mutations: Mutation.array(),
})
export type Rule = z.infer<typeof Rule>

export const FeedTransform = z.object({
  feed_url: z.string().url(),
  rules: Rule.array(),
})

export type FeedTransform = z.infer<typeof FeedTransform>
