import { FormControl, FormLabel, Input } from "@mui/joy"
import { z } from "zod"

import { RemoveMutation } from "@app/utils/rules"

import { MutationFormProps } from "."

type Props = MutationFormProps<z.infer<typeof RemoveMutation>>

export default function RemoveForm({ mutation, onChange }: Props) {
  return (
    <FormControl>
      <FormLabel>XPath</FormLabel>
      <Input
        value={mutation.xpath}
        placeholder="Blank means remove self"
        onChange={(e) => onChange({ ...mutation, xpath: e.target.value })}
      />
    </FormControl>
  )
}
