import { SyntheticEvent } from "react"

export function stopPropagation<
  E extends SyntheticEvent,
  T extends React.EventHandler<E>
>(handler: T): React.EventHandler<E> {
  return (e) => {
    e.stopPropagation()
    handler(e)
  }
}
