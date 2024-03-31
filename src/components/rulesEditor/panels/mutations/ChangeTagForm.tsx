import { z } from "zod"
import { FormControl, FormLabel, Stack } from "@mui/joy"

import { ChangeTagMutation } from "@app/utils/rules"
import DebouncedInput from "@app/components/DebounceInput"

import { MutationFormProps } from "."

type Props = MutationFormProps<z.infer<typeof ChangeTagMutation>>

export default function ChangeTagForm({ mutation, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <DebouncedInput
          value={mutation.xpath}
          placeholder="Blank means change self"
          onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Tag Name</FormLabel>
        <DebouncedInput
          value={mutation.args.tag}
          onChange={(e) =>
            onChange({ ...mutation, args: { tag: e.target.value } })
          }
        />
      </FormControl>
    </Stack>
  )
}
