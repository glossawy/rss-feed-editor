import type { Condition, Mutation, Rule } from "../utils/rules"

import { Stack, Button, Typography, Grid } from "@mui/joy"
import { Conditions, Mutations, Rules } from "../utils/factories"

export type RuleAction =
  | { type: "addRule"; rule: Rule }
  | { type: "addCondition"; condition: Condition }
  | { type: "addMutation"; mutation: Mutation }

type Props = {
  onRuleAction: (action: RuleAction) => void
  ruleOnly?: boolean
  disabled?: boolean
}

export default function RuleActions({
  onRuleAction,
  ruleOnly = false,
  disabled = false,
}: Props) {
  const emitAction = (action: RuleAction) => {
    return () => {
      onRuleAction(action)
    }
  }

  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid xs={2}>
        <Typography level="title-sm">Add a Rule</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={emitAction({ type: "addRule", rule: Rules.empty({}) })}
            disabled={disabled}
          >
            Empty Rule
          </Button>
        </Stack>
      </Grid>
      <Grid xs={2}>
        <Typography level="title-sm">Add a Condition</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={emitAction({
              type: "addCondition",
              condition: Conditions.contains({}),
            })}
            disabled={ruleOnly || disabled}
          >
            Contains
          </Button>
        </Stack>
      </Grid>
      <Grid xs={2}>
        <Typography level="title-sm">Add a Mutation</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={emitAction({
              type: "addMutation",
              mutation: Mutations.remove({}),
            })}
            disabled={ruleOnly || disabled}
          >
            Remove
          </Button>
          <Button
            onClick={emitAction({
              type: "addMutation",
              mutation: Mutations.replace({}),
            })}
            disabled={ruleOnly || disabled}
          >
            Replace
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )
}
