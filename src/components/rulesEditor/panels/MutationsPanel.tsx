import { Option, Select, Stack } from "@mui/joy"
import { Mutation } from "../../../utils/rules"
import collections from "../../../utils/collections"
import OrderedCardList from "../../OrderedCardList"
import RemoveForm from "./mutations/RemoveForm"
import { MutationFormProps } from "./mutations"
import { useCallback } from "react"
import { DefaultFactories } from "../../../utils/defaults"
import ChangeTagForm from "./mutations/ChangeTagForm"
import ReplaceForm from "./mutations/ReplaceForm"

type Props = {
  mutations: Mutation[]
  onChange: (muts: Mutation[]) => void
}

function PickMutationForm({ mutation, onChange }: MutationFormProps<Mutation>) {
  switch (mutation.name) {
    case "remove":
      return <RemoveForm mutation={mutation} onChange={onChange} />
    case "changeTag":
      return <ChangeTagForm mutation={mutation} onChange={onChange} />
    case "replace":
      return <ReplaceForm mutation={mutation} onChange={onChange} />
  }
}

function MutationForm({ mutation, onChange }: MutationFormProps<Mutation>) {
  return (
    <Stack spacing={1}>
      <Select
        value={mutation.name}
        onChange={(_e, value) => onChange(DefaultFactories.mutations[value!]())}
      >
        <Option value="remove">Remove Element</Option>
        <Option value="changeTag">Change Tag</Option>
        <Option value="replace">Replace Text</Option>
      </Select>
      <PickMutationForm mutation={mutation} onChange={onChange} />
    </Stack>
  )
}

export default function MutationsPanel({ mutations, onChange }: Props) {
  const mutationsWithId = mutations.map((m, idx) => ({ ...m, id: idx }))

  const handleAddMutation = useCallback(() => {
    onChange([...mutations, DefaultFactories.mutation()])
  }, [mutations, onChange])

  return (
    <Stack spacing={1}>
      <OrderedCardList
        items={mutationsWithId}
        render={(m) => (
          <MutationForm
            mutation={m}
            onChange={(mut) =>
              onChange(collections.placeAt(mut, mutations, m.id))
            }
          />
        )}
        reorderable
        deletable
        addable
        onAdd={handleAddMutation}
        onMoveUp={(m) => onChange(collections.shiftItemLeftAt(mutations, m.id))}
        onMoveDown={(m) =>
          onChange(collections.shiftItemRightAt(mutations, m.id))
        }
        onDelete={(m) => onChange(mutations.filter((_m, idx) => idx !== m.id))}
      />
    </Stack>
  )
}
