import RulesEditor, { JSONValue } from "./components/RulesEditor"
import FeedDiff from "./components/FeedDiff"
import RulesEditorForm, { FormValues } from "./components/RulesEditorForm"

import { useCallback, useState } from "react"
import { Stack, CssVarsProvider, CssBaseline, Typography, Link } from "@mui/joy"

import { type FeedTransform } from "./utils/rules"
import * as api from "./utils/api"
import useFeedTransform from "./useFeedTransform"

function App() {
  const [feedUrl, setFeedUrl] = useState("")
  const [feedTransform, dispatch] = useFeedTransform()
  const [encodedRules, setEncodedRules] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (formValues: FormValues) => {
      const { feedUrl } = formValues

      setFeedUrl(feedUrl)
      dispatch({ type: "setUrl", url: feedUrl })
    },
    [dispatch]
  )

  const handleJsonUpdate = useCallback(
    (json: JSONValue) => {
      const newTransform = json as FeedTransform
      const newFeedRules = { ...newTransform, feed_url: feedUrl }

      dispatch({ type: "replace", transform: newFeedRules })
      api.encodeRules(newFeedRules).then(setEncodedRules)
    },
    [dispatch, feedUrl]
  )

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Stack sx={{ margin: 4 }} spacing={2}>
        <RulesEditorForm onSubmit={handleSubmit} />
        <Stack id="rss-outputs" spacing={0}>
          <Typography level="title-sm">Transformed Feed URL</Typography>
          {encodedRules ? (
            <Link
              href={`http://localhost:5000/rewrite/?r=${encodedRules}`}
              level="body-sm"
            >
              http://localhost:5000/rewrite/?r={encodedRules}
            </Link>
          ) : (
            <Typography level="body-sm">No valid rules yet</Typography>
          )}
        </Stack>
        <Stack spacing={1}>
          <RulesEditor
            readOnly={encodedRules === null}
            value={feedTransform}
            readOnlyKeys={["feed_url", "rules"]}
            onChange={handleJsonUpdate}
            onAction={dispatch}
          />
          <FeedDiff feedUrl={feedUrl} encodedRules={encodedRules} />
        </Stack>
      </Stack>
    </CssVarsProvider>
  )
}

export default App
