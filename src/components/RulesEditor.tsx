import { useCallback, useState } from "react"
import { Grid, Stack } from "@mui/joy"
import EditorSidebar from "./rulesEditor/EditorSidebar"
import {
  RuleWithMetadata,
  useFeedData,
  useFeedDataDispatch,
} from "../contexts/feedData"
import EditorRuleView from "./rulesEditor/EditorRuleView"
import { DefaultFactories } from "../utils/defaults"
import { Rule } from "../utils/rules"

export default function RulesEditor() {
  const [targetRuleId, setTargetRuleId] = useState<number | null>(null)

  const { rules } = useFeedData()
  const dispatch = useFeedDataDispatch()

  const targetRule = rules.find((r) => r.id == targetRuleId)

  const handleRuleSelect = useCallback(
    (rule: RuleWithMetadata) => {
      setTargetRuleId(rule.id)
    },
    [setTargetRuleId]
  )

  const handleRename = useCallback(
    (rule: RuleWithMetadata) => {
      dispatch({
        type: "rawReplace",
        ruleId: rule.id,
        rule: rule,
      })
    },
    [dispatch]
  )

  const handleMoveUp = useCallback(
    (rule: RuleWithMetadata) => {
      dispatch({
        type: "shiftUp",
        ruleId: rule.id,
      })
    },
    [dispatch]
  )

  const handleDelete = useCallback(
    (rule: RuleWithMetadata) => {
      dispatch({
        type: "delete",
        ruleId: rule.id,
      })
    },
    [dispatch]
  )

  const handleMoveDown = useCallback(
    (rule: RuleWithMetadata) => {
      dispatch({
        type: "shiftDown",
        ruleId: rule.id,
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
        ruleId: targetRule.id,
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
