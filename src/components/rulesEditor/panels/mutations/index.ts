import { Mutation } from "@app/utils/rules"

export type MutationFormProps<T extends Mutation> = {
  mutation: T
  onChange: (mutation: Mutation) => void
}
