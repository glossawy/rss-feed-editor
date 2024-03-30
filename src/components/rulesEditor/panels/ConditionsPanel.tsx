import { Condition } from "@app/utils/rules"

import ConditionResolver from "./conditions/ConditionResolver"

type Props = {
  condition: Condition
  onChange: (cond: Condition) => void
}

export default function ConditionsPanel({ condition, onChange }: Props) {
  return <ConditionResolver condition={condition} onChange={onChange} />
}
