import { z } from "zod"
import { ConditionFormProps } from "."
import { ContainsCondition } from "../../../../utils/rules"
import { FormControl, FormLabel, Stack } from "@mui/joy"
import DebouncedInput from "../../../DebounceInput"

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
          placeholder="Blank means remove self"
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
