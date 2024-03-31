import { Checkbox, FormControl, FormLabel, Input, Stack } from "@mui/joy"
import { z } from "zod"

import { ReplaceMutation } from "@app/utils/rules"

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
        <Input
          value={mutation.xpath}
          placeholder="Blank means replace self"
          onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Pattern</FormLabel>
        <Input
          value={mutation.args.pattern}
          onChange={(e) => setArg({ pattern: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Replacement</FormLabel>
        <Input
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
