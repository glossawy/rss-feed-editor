import { useForm } from "react-hook-form"
import { FormControl, Input, FormLabel } from "@mui/joy"

export type FormValues = {
  feedUrl: string
}

type Props = {
  onSubmit: (values: FormValues) => void
}

export default function RulesEditorForm({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormValues>()

  return (
    <form id="rss-inputs" onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel>RSS Feed Link</FormLabel>
        <Input {...register("feedUrl")} type="url" />
      </FormControl>
    </form>
  )
}
