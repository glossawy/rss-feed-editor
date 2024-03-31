import { FormControl, FormLabel, Input, Stack } from "@mui/joy"
import { z } from "zod"

import { ChangeTagMutation } from "@app/utils/rules"

import { MutationFormProps } from "."

type Props = MutationFormProps<z.infer<typeof ChangeTagMutation>>

export default function ChangeTagForm({ mutation, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <Input
          value={mutation.xpath}
          placeholder="Blank means change self"
          onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Tag Name</FormLabel>
        <Input
          value={mutation.args.tag}
          onChange={(e) =>
            onChange({ ...mutation, args: { tag: e.target.value } })
          }
        />
      </FormControl>
    </Stack>
  )
}
