import { FormControl, FormLabel, Input, Stack } from "@mui/joy"
import { z } from "zod"

import { ContainsCondition } from "@app/utils/rules"

import { ConditionFormProps } from "."

export default function ContainsForm({
  condition,
  onChange,
}: ConditionFormProps<z.infer<typeof ContainsCondition>>) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <Input
          value={condition.xpath}
          placeholder="Blank means within self"
          onChange={(e) => onChange({ ...condition, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Match Text (Regular Expression)</FormLabel>
        <Input
          value={condition.args.pattern}
          onChange={(e) =>
            onChange({ ...condition, args: { pattern: e.target.value } })
          }
        />
      </FormControl>
    </Stack>
  )
}
