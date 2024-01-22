import { z } from "zod"
import { RemoveMutation } from "../../../../utils/rules"
import { FormControl, FormLabel } from "@mui/joy"
import { MutationFormProps } from "."
import DebouncedInput from "../../../DebounceInput"

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
