import { z } from "zod"
import { Checkbox, FormControl, FormLabel, Stack } from "@mui/joy"

import { ReplaceMutation } from "@app/utils/rules"
import DebouncedInput from "@app/components/DebounceInput"

import { MutationFormProps } from "."

type Props = MutationFormProps<z.infer<typeof ReplaceMutation>>

export default function ReplaceForm({ mutation, onChange }: Props) {
  const setArg = (values: Partial<z.infer<typeof ReplaceMutation>["args"]>) => {
    onChange({ ...mutation, args: { ...mutation.args, ...values } })
  }

  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <DebouncedInput
          value={mutation.xpath}
          placeholder="Blank means replace self"
          onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Pattern</FormLabel>
        <DebouncedInput
          value={mutation.args.pattern}
          onChange={(e) => setArg({ pattern: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Replacement</FormLabel>
        <DebouncedInput
          value={mutation.args.replacement}
          onChange={(e) => setArg({ replacement: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Trim Whitespace after Replacement</FormLabel>
        <Checkbox
          checked={mutation.args.trim}
          onChange={(e) => setArg({ trim: e.target.checked })}
        />
      </FormControl>
    </Stack>
  )
}
