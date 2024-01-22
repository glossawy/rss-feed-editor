import { Mutation } from "../../../../utils/rules"

export type MutationFormProps<T extends Mutation> = {
  mutation: T
  onChange: (mutation: Mutation) => void
}
