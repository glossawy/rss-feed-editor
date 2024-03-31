import { FormControl, FormLabel, Input } from "@mui/joy"
import React, { useCallback } from "react"
import { useForm } from "react-hook-form"

import { useFeedData, useFeedDataDispatch } from "@app/hooks/feedData"

export type FormValues = {
  feedUrl: string
}

export default function FeedUrlForm() {
  const { feedUrl } = useFeedData()
  const dispatch = useFeedDataDispatch()
  const { register, handleSubmit } = useForm<FormValues>()

  const setUrl = useCallback(
    (url: string) => dispatch({ type: "setUrl", feedUrl: url }),
    [dispatch]
  )

  const onSubmit = useCallback(
    (values: FormValues) => setUrl(values.feedUrl),
    [setUrl]
  )

  const { onBlur: onFeedUrlBlur, ...feedUrlProps } = register("feedUrl")

  const onBlur = useCallback(
    (evt: React.FocusEvent<HTMLInputElement>) => {
      setUrl(evt.target.value)
      onFeedUrlBlur(evt)
    },
    [onFeedUrlBlur, setUrl]
  )

  return (
    <form id="rss-inputs" onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel>RSS Feed Link</FormLabel>
        <Input
          {...feedUrlProps}
          onBlur={onBlur}
          defaultValue={feedUrl}
          type="url"
        />
      </FormControl>
    </form>
  )
}
