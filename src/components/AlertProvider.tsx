import { PropsWithChildren, useReducer } from "react"

import {
  Alert,
  AlertsAction,
  AlertsContext,
  AlertsDispatchContext,
} from "@app/hooks/alerts"

type Props = PropsWithChildren

export default function AlertProvider({ children }: Props) {
  const [alerts, dispatch] = useReducer<React.Reducer<Alert[], AlertsAction>>(
    alertsReducer,
    []
  )

  return (
    <AlertsContext.Provider value={{ alerts }}>
      <AlertsDispatchContext.Provider value={dispatch}>
        {children}
      </AlertsDispatchContext.Provider>
    </AlertsContext.Provider>
  )
}

let nextAlertId = 1
function alertsReducer(alerts: Alert[], action: AlertsAction): Alert[] {
  switch (action.type) {
    case "add":
      return [...alerts, { ...action.alert, id: nextAlertId++ }]
    case "remove":
      return alerts.filter((alert) => alert.id !== action.alertId)
  }
}
