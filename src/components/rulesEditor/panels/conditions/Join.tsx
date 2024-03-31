import OrderedCardList from "@app/components/OrderedCardList"
import collections from "@app/utils/collections"
import { DefaultFactories } from "@app/utils/defaults"
import { Condition } from "@app/utils/rules"

import ConditionResolver from "./ConditionResolver"

type Props = {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
}

export default function Join({ conditions, onChange }: Props) {
  const conditionsWithId = conditions.map((c, idx) => ({ ...c, id: idx }))

  return (
    <OrderedCardList
      reorderable
      addable
      deletable
      items={conditionsWithId}
      render={(c) => (
        <ConditionResolver
          condition={c}
          onChange={(newCond) =>
            onChange(collections.placeAt(newCond, conditions, c.id))
          }
        />
      )}
      onAdd={() => onChange([...conditions, DefaultFactories.condition()])}
      onMoveUp={(c) => onChange(collections.shiftItemLeftAt(conditions, c.id))}
      onMoveDown={(c) =>
        onChange(collections.shiftItemRightAt(conditions, c.id))
      }
      onDelete={(c) => onChange(collections.removeAt(conditions, c.id))}
    />
  )
}
