import { z } from "zod"
import { FormControl, FormLabel } from "@mui/joy"

import { RemoveMutation } from "@app/utils/rules"
import DebouncedInput from "@app/components/DebounceInput"

import { MutationFormProps } from "."

type Props = MutationFormProps<z.infer<typeof RemoveMutation>>

export default function RemoveForm({ mutation, onChange }: Props) {
  return (
    <FormControl>
      <FormLabel>XPath</FormLabel>
      <DebouncedInput
        value={mutation.xpath}
        placeholder="Blank means remove self"
        onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
      />
    </FormControl>
  )
}
