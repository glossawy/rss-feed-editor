import { Condition } from "@app/utils/rules"

export type ConditionFormProps<T extends Condition> = {
  condition: T
  onChange: (cond: Condition) => void
}
