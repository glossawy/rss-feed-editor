import { Sheet } from "@mui/joy"

import EditableLabel from "@app/components/EditableLabel"
import OrderedCardList from "@app/components/OrderedCardList"
import { RuleWithMetadata } from "@app/hooks/feedData"

// TODO: Turn EditorSidebar list into reusable, generic OrderedCardList that allows arbitrary card contents
// TODO: Use OrderedCardList to implement Condition tree editor using nested card lists, it will work but be gross
//       Each type of condition will need it's own input
// TODO: Use OrderedCardList to implement Mutations editor

type Props = {
  rules: RuleWithMetadata[]
  onNewRule?: () => void
  onRename: (rule: RuleWithMetadata) => void
  onSelect: (rule: RuleWithMetadata) => void
  onMoveUp: (rule: RuleWithMetadata) => void
  onMoveDown: (rule: RuleWithMetadata) => void
  onDelete: (rule: RuleWithMetadata) => void
}

export default function EditorSidebar({
  rules,
  onNewRule,
  onRename,
  onSelect,
  onMoveDown,
  onMoveUp,
  onDelete,
}: Props) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 2,
        borderRadius: 10,
        minHeight: "75vh",
        maxHeight: "75vh",
        overflow: "hidden",
      }}
    >
      <OrderedCardList
        items={rules}
        keyfn={(rule) => rule.id}
        render={(rule) => (
          <EditableLabel
            label={rule.name}
            onChange={(name) => onRename({ ...rule, name })}
          />
        )}
        onAdd={onNewRule}
        onSelect={onSelect}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        sx={{ height: "100%", overflow: "auto" }}
        reorderable
        deletable
        addable
      />
    </Sheet>
  )
}
