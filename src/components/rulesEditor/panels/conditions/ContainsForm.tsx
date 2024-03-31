import { z } from "zod"
import { FormControl, FormLabel, Stack } from "@mui/joy"

import { ContainsCondition } from "@app/utils/rules"
import DebouncedInput from "@app/components/DebounceInput"

import { ConditionFormProps } from "."

export default function ContainsForm({
  condition,
  onChange,
}: ConditionFormProps<z.infer<typeof ContainsCondition>>) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <DebouncedInput
          value={condition.xpath}
          placeholder="Blank means within self"
          onChange={(e) => onChange({ ...condition, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Match Text</FormLabel>
        <DebouncedInput
          value={condition.args.value}
          onChange={(e) =>
            onChange({ ...condition, args: { value: e.target.value } })
          }
        />
      </FormControl>
    </Stack>
  )
}
