import RulesEditor, { Action, JSONValue } from "./components/RulesEditor"
import FeedDiff from "./components/FeedDiff"
import RulesEditorForm, { FormValues } from "./components/RulesEditorForm"

import { useCallback, useState } from "react"
import { Stack, CssVarsProvider, CssBaseline, Typography, Link } from "@mui/joy"

import { addToCondition, type FeedTransform, type Rule } from "./utils/rules"
import { FeedTransforms } from "./utils/factories"
import * as api from "./utils/api"

function App() {
  const [feedUrl, setFeedUrl] = useState("")
  const [feedRules, setFeedRules] = useState<FeedTransform>(
    FeedTransforms.empty()
  )
  const [encodedRules, setEncodedRules] = useState<string | null>(null)

  const handleSubmit = useCallback(
    (formValues: FormValues) => {
      const { feedUrl } = formValues

      setFeedUrl(feedUrl)
      setFeedRules({ ...feedRules, feed_url: feedUrl })
    },
    [feedRules]
  )

  const handleJsonUpdate = useCallback(
    (json: JSONValue) => {
      const newTransform = json as FeedTransform
      const newFeedRules = { ...newTransform, feed_url: feedUrl }

      setFeedRules(newFeedRules)
      api.encodeRules(newFeedRules).then(setEncodedRules)
    },
    [feedUrl]
  )

  const handleEditorAction = useCallback(
    (action: Action) => {
      const updateRule = (
        index: number,
        transform: (rule: Rule) => Rule
      ): FeedTransform => {
        const newRules = [...feedRules.rules]
        const rule = newRules[index]

        newRules[index] = transform(rule)
        return { ...feedRules, rules: newRules }
      }

      switch (action.type) {
        case "rule":
          setFeedRules({
            ...feedRules,
            rules: [...feedRules.rules, action.rule],
          })
          break
        case "mutation":
          setFeedRules(
            updateRule(action.index, (rule) => ({
              ...rule,
              mutations: [...rule.mutations, action.mutation],
            }))
          )
          break
        case "condition":
          setFeedRules(
            updateRule(action.index, (rule) => ({
              ...rule,
              condition: addToCondition(rule.condition, action.condition),
            }))
          )
          break
        default:
          break
      }
    },
    [feedRules]
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
            value={feedRules}
            readOnlyKeys={["feed_url", "rules"]}
            onChange={handleJsonUpdate}
            onAction={handleEditorAction}
          />
          <FeedDiff feedUrl={feedUrl} encodedRules={encodedRules} />
        </Stack>
      </Stack>
    </CssVarsProvider>
  )
}

export default App
