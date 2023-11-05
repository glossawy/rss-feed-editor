import RulesEditor, { Action } from "./components/RulesEditor"
import FeedDiff from "./components/FeedDiff"
import RulesEditorForm, { FormValues } from "./components/RulesEditorForm"

import { useEffect, useState } from "react"
import {
  Box,
  Stack,
  CssVarsProvider,
  CssBaseline,
  Typography,
  Link,
} from "@mui/joy"

import type { FeedTransform, Rule } from "./utils/rules"
import { FeedTransforms, Conditions, Mutations } from "./utils/factories"
import * as api from "./utils/api"

function App() {
  const [feedUrl, setFeedUrl] = useState("")
  const [rulesJson, setRulesJson] = useState<FeedTransform>(
    FeedTransforms.empty()
  )
  const [encodedRules, setEncodedRules] = useState<string | null>(null)

  function handleSubmit(formValues: FormValues) {
    const { feedUrl } = formValues

    setFeedUrl(feedUrl)
    setRulesJson({ ...rulesJson, feed_url: feedUrl })
  }

  function handleJsonUpdate(newTransform: FeedTransform) {
    setRulesJson({ ...newTransform, feed_url: feedUrl })
  }

  function handleEditorAction(action: Action) {
    const updateRule = (
      index: number,
      transform: (rule: Rule) => Rule
    ): FeedTransform => {
      const newRules = [...rulesJson.rules]
      const rule = newRules[index]

      newRules[index] = transform(rule)
      return { ...rulesJson, rules: newRules }
    }

    switch (action.type) {
      case "rule":
        setRulesJson({
          ...rulesJson,
          rules: [
            ...rulesJson.rules,
            {
              xpath: "//",
              condition: Conditions.contains({ value: "" }),
              mutations: [],
            },
          ],
        })
        break
      case "mutation":
        setRulesJson(
          updateRule(action.index, (rule) => ({
            ...rule,
            mutations: [...rule.mutations, Mutations.remove({})],
          }))
        )
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (rulesJson.feed_url === "") return

    api.encodeRules(rulesJson).then(setEncodedRules)
  }, [rulesJson])

  return (
    <CssVarsProvider>
      <CssBaseline />
      <Stack sx={{ margin: 4 }}>
        <RulesEditorForm onSubmit={handleSubmit} />
        <Box id="rss-outputs" sx={{ paddingY: 2 }}>
          <Typography level="title-sm">Transformed Feed URL</Typography>
          <Link
            href={`http://localhost:5000/rewrite/?r=${encodedRules}`}
            level="body-sm"
          >
            http://localhost:5000/rewrite/?r={encodedRules}
          </Link>
        </Box>
        <Stack spacing={2}>
          <RulesEditor
            readOnly={encodedRules === null}
            value={rulesJson}
            readOnlyKeys={["feed_url", "rules"]}
            onChange={(json) => handleJsonUpdate(json as FeedTransform)}
            onAction={handleEditorAction}
          />
          <FeedDiff
            key={feedUrl}
            feedUrl={feedUrl}
            encodedRules={encodedRules}
          />
        </Stack>
      </Stack>
    </CssVarsProvider>
  )
}

export default App
