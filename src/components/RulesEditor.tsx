import { Grid, Stack } from "@mui/joy"
import { useCallback, useState } from "react"

import {
  RuleId,
  useFeedTransform,
  useFeedTransformDispatch,
} from "@app/hooks/feedTransform"
import { DefaultFactories } from "@app/utils/defaults"
import { Rule } from "@app/utils/rules"

import EditorRuleView from "./rulesEditor/EditorRuleView"
import EditorSidebar from "./rulesEditor/EditorSidebar"

export default function RulesEditor() {
  const [targetRuleId, setTargetRuleId] = useState<RuleId | null>(null)

  const { rules } = useFeedTransform()
  const dispatch = useFeedTransformDispatch()

  const targetRule = rules.find((r) => r.rid == targetRuleId)

  const handleRuleSelect = useCallback(
    (rule: Rule) => {
      setTargetRuleId(rule.rid)
    },
    [setTargetRuleId]
  )

  const handleRename = useCallback(
    (rule: Rule) => {
      dispatch({
        type: "rawReplace",
        ruleId: rule.rid,
        rule: rule,
      })
    },
    [dispatch]
  )

  const handleMoveUp = useCallback(
    (rule: Rule) => {
      dispatch({
        type: "shiftUp",
        ruleId: rule.rid,
      })
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    (rule: Rule) => {
      dispatch({
        type: "delete",
        ruleId: rule.rid,
      })
    },
    [dispatch]
  )

  const handleMoveDown = useCallback(
    (rule: Rule) => {
      dispatch({
        type: "shiftDown",
        ruleId: rule.rid,
      })
    },
    [dispatch]
  )

  const handleNewRule = useCallback(() => {
    dispatch({
      type: "add",
      rule: DefaultFactories.rule(),
    })
  }, [dispatch])

  const handleRuleChange = useCallback(
    (rule: Rule) => {
      if (!targetRule) return

      dispatch({
        type: "replace",
        ruleId: targetRule.rid,
        rule,
      })
    },
    [targetRule, dispatch]
  )

  return (
    <Stack>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid xs={4}>
          <Stack spacing={2}>
            <EditorSidebar
              rules={rules}
              onSelect={handleRuleSelect}
              onRename={handleRename}
              onNewRule={handleNewRule}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={handleDelete}
            />
          </Stack>
        </Grid>
        <Grid xs={8}>
          <EditorRuleView
            rule={targetRule || null}
            onChange={handleRuleChange}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
