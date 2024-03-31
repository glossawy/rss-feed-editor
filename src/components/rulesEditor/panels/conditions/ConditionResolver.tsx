import { FormControl, FormLabel, Option, Select, Stack } from "@mui/joy"

import { DefaultFactories } from "@app/utils/defaults"
import { Condition, SingleCondition } from "@app/utils/rules"

import ContainsForm from "./ContainsForm"
import Join from "./Join"

type Props = {
  condition: Condition
  onChange: (condition: Condition) => void
}

function Resolve({ condition, onChange }: Props) {
  if ("all_of" in condition) {
    return (
      <Join
        conditions={condition.all_of}
        onChange={(conditions) => onChange({ all_of: conditions })}
      />
    )
  } else if ("any_of" in condition) {
    return (
      <Join
        conditions={condition.any_of}
        onChange={(conditions) => onChange({ any_of: conditions })}
      />
    )
  } else {
    switch (condition.name) {
      case "contains":
        return <ContainsForm condition={condition} onChange={onChange} />
    }
  }
}

const getConditionName = (
  cond: Condition
): "allOf" | "anyOf" | SingleCondition["name"] => {
  if ("all_of" in cond) {
    return "allOf"
  } else if ("any_of" in cond) {
    return "anyOf"
  } else {
    return cond.name
  }
}

export default function ConditionResolver({ condition, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>Condition Type</FormLabel>
        <Select
          value={getConditionName(condition)}
          onChange={(_e, value) =>
            onChange(DefaultFactories.conditions[value!]())
          }
        >
          <Option value="allOf">All Of (AND)</Option>
          <Option value="anyOf">Any Of (OR)</Option>
          <Option value="contains">Contains Text</Option>
        </Select>
      </FormControl>
      <Resolve condition={condition} onChange={onChange} />
    </Stack>
  )
}
