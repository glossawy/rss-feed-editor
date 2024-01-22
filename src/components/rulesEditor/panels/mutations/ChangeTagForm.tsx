import { z } from "zod"
import { ChangeTagMutation } from "../../../../utils/rules"
import { FormControl, FormLabel, Stack } from "@mui/joy"
import { MutationFormProps } from "."
import DebouncedInput from "../../../DebounceInput"

type Props = MutationFormProps<z.infer<typeof ChangeTagMutation>>

export default function ChangeTagForm({ mutation, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <FormControl>
        <FormLabel>XPath</FormLabel>
        <DebouncedInput
          value={mutation.xpath}
          placeholder="Blank means remove self"
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
