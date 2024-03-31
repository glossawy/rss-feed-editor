import {
  Box,
  FormControl,
  FormLabel,
  Sheet,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy"
import { useCallback } from "react"

import { RuleWithMetadata } from "@app/hooks/feedData"
import { Condition, Mutation, Rule } from "@app/utils/rules"
import DebouncedInput from "@app/components/DebounceInput"

import MutationsPanel from "./panels/MutationsPanel"
import ConditionsPanel from "./panels/ConditionsPanel"

type Props = {
  rule: RuleWithMetadata | null
  onChange: (rule: Rule) => void
}

function EmptyView() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Typography>Nothing to show</Typography>
      <Typography>Select a rule to edit</Typography>
    </Box>
  )
}

function RuleView({
  rule,
  onChange,
}: {
  rule: Rule
  onChange: (rule: Rule) => void
}) {
  const handleXPathChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...rule, xpath: e.target.value })
    },
    [onChange, rule]
  )

  const handleConditionUpdate = useCallback(
    (cond: Condition) => {
      onChange({ ...rule, condition: cond })
    },
    [rule, onChange]
  )

  const handleMutationsUpdate = useCallback(
    (muts: Mutation[]) => {
      onChange({ ...rule, mutations: muts })
    },
    [onChange, rule]
  )

  return (
    <Box sx={{ maxHeight: "100%", overflow: "scroll" }}>
      <FormControl sx={{ padding: 1 }}>
        <FormLabel>Target XPath</FormLabel>
        <DebouncedInput value={rule.xpath} onChange={handleXPathChange} />
      </FormControl>
      <Tabs defaultValue="conditions">
        <TabList>
          <Tab value="conditions">Conditions</Tab>
          <Tab value="mutations">Mutations</Tab>
        </TabList>
        <TabPanel value="conditions">
          <ConditionsPanel
            condition={rule.condition}
            onChange={handleConditionUpdate}
          />
        </TabPanel>
        <TabPanel value="mutations">
          <MutationsPanel
            mutations={rule.mutations}
            onChange={handleMutationsUpdate}
          />
        </TabPanel>
      </Tabs>
    </Box>
  )
}

export default function EditorRuleView({ rule: ruleWithId, onChange }: Props) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        borderRadius: 10,
        padding: 0,
        minHeight: "200px",
        height: "100%",
        maxHeight: "75vh",
      }}
    >
      {ruleWithId ? (
        <RuleView rule={ruleWithId.rule} onChange={onChange} />
      ) : (
        <EmptyView />
      )}
    </Sheet>
  )
}
