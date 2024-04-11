import { FormControl, FormLabel, Input } from "@mui/joy"
import React, { useCallback } from "react"
import { useForm } from "react-hook-form"

import {
  useFeedTransform,
  useFeedTransformDispatch,
} from "@app/hooks/feedTransform"

export type FormValues = {
  feedUrl: string
}

export default function FeedUrlForm() {
  const { feed_url: feedUrl } = useFeedTransform()
  const dispatch = useFeedTransformDispatch()
  const { register, handleSubmit } = useForm<FormValues>()

  const setUrl = useCallback(
    (url: string) => dispatch({ type: "setUrl", feedUrl: url }),
    [dispatch]
  )

  const onSubmit = useCallback(
    (values: FormValues) => setUrl(values.feedUrl),
    [setUrl]
  )

  const {
    onBlur: onFeedUrlBlur,
    onChange: onFeedUrlChange,
    ...feedUrlProps
  } = register("feedUrl")

  const onBlur = useCallback(
    (evt: React.FocusEvent<HTMLInputElement>) => {
      setUrl(evt.target.value)
      onFeedUrlBlur(evt)
    },
    [onFeedUrlBlur, setUrl]
  )

  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(evt.target.value)
      onFeedUrlChange(evt)
    },
    [onFeedUrlChange, setUrl]
  )

  return (
    <form id="rss-inputs" onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel>RSS Feed Link</FormLabel>
        <Input
          {...feedUrlProps}
          onBlur={onBlur}
          onChange={onChange}
          defaultValue={feedUrl}
          type="url"
        />
      </FormControl>
    </form>
  )
}
