import { useForm } from "react-hook-form"
import { FormControl, FormLabel, Input } from "@mui/joy"
import { useCallback } from "react"

import { useFeedData, useFeedDataDispatch } from "@app/contexts/feedData"

export type FormValues = {
  feedUrl: string
}

export default function FeedUrlForm() {
  const { feedUrl } = useFeedData()
  const dispatch = useFeedDataDispatch()
  const { register, handleSubmit } = useForm<FormValues>()

  const onSubmit = useCallback(
    (values: FormValues) => {
      dispatch({ type: "setUrl", feedUrl: values.feedUrl })
    },
    [dispatch]
  )

  return (
    <form id="rss-inputs" onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel>RSS Feed Link</FormLabel>
        <Input {...register("feedUrl")} defaultValue={feedUrl} type="url" />
      </FormControl>
    </form>
  )
}
