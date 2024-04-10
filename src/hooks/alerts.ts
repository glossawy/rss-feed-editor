import { createContext, useCallback, useContext } from "react"

export type AlertType = "success" | "warn" | "error"

export type AlertId = number

export type Alert = {
  id: AlertId
  type: AlertType
  message: string
  durationMillis: number
}

export type AlertWithoutId = Omit<Alert, "id">

export type AlertState = {
  alerts: Alert[]
}

export type AlertsAction =
  | { type: "add"; alert: AlertWithoutId }
  | { type: "remove"; alertId: AlertId }

export const AlertsContext = createContext<AlertState>({
  alerts: [],
})

export const AlertsDispatchContext = createContext<
  React.Dispatch<AlertsAction>
>((action) => {
  console.warn(
    `Attempted to dispatch alert action without defined context: ${action.type}`
  )
})

export function useAlerts() {
  const { alerts } = useContext(AlertsContext)
  const dispatch = useContext(AlertsDispatchContext)

  const success = useCallback(
    (message: string, durationMillis: number = 3000) =>
      dispatch({
        type: "add",
        alert: { type: "success", message, durationMillis },
      }),
    [dispatch]
  )

  const warn = useCallback(
    (message: string, durationMillis: number = 3000) =>
      dispatch({
        type: "add",
        alert: { type: "warn", message, durationMillis },
      }),
    [dispatch]
  )

  const error = useCallback(
    (message: string, durationMillis: number = 3000) =>
      dispatch({
        type: "add",
        alert: { type: "error", message, durationMillis },
      }),
    [dispatch]
  )

  const clear = useCallback(
    (alertId: AlertId) => dispatch({ type: "remove", alertId }),
    [dispatch]
  )

  return {
    alerts,
    commands: {
      success,
      warn,
      error,
      clear,
    },
  }
}
