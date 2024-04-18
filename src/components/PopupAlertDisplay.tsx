import { CloseRounded } from "@mui/icons-material"
import { Alert, IconButton, Stack, Typography } from "@mui/joy"
import { useState } from "react"

import { AlertId, AlertType, useAlerts } from "@app/hooks/alerts"

type AlertTimeoutMap = Map<number, NodeJS.Timeout>

const ALERT_TYPE_MAP: Record<
  AlertType,
  { color: "success" | "warning" | "danger"; title: string }
> = {
  success: {
    title: "Success",
    color: "success",
  },
  warn: {
    title: "Warning",
    color: "warning",
  },
  error: {
    title: "Error",
    color: "danger",
  },
}

export default function PopupAlertDisplay() {
  const [alertTimeouts, setAlertTimeouts] = useState<AlertTimeoutMap>(new Map())
  const {
    alerts,
    commands: { clear },
  } = useAlerts()

  const alertIds = new Set(alerts.map((a) => a.id))
  const clearedIds = Array.from(alertTimeouts.keys()).filter(
    (alertId) => !alertIds.has(alertId)
  )

  if (clearedIds.length > 0) {
    const newAlertTimeouts = new Map(alertTimeouts)
    clearedIds.forEach((id) => newAlertTimeouts.delete(id))

    setAlertTimeouts(newAlertTimeouts)
  }

  alerts.forEach((alert) => {
    if (alertTimeouts.has(alert.id)) return

    alertTimeouts.set(
      alert.id,
      setTimeout(() => {
        clear(alert.id)
      }, alert.durationMillis)
    )
  })

  const handleClose = (alertId: AlertId) => {
    return () => clear(alertId)
  }

  return (
    <Stack
      direction={"column-reverse"}
      spacing={1}
      sx={{ position: "absolute", bottom: 30, right: 30 }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          color={ALERT_TYPE_MAP[alert.type].color}
          variant="soft"
          sx={{ minWidth: 400, maxWidth: 400, paddingY: 1 }}
          endDecorator={
            <IconButton
              color={ALERT_TYPE_MAP[alert.type].color}
              onClick={handleClose(alert.id)}
            >
              <CloseRounded />
            </IconButton>
          }
        >
          <div>
            <div>{ALERT_TYPE_MAP[alert.type].title}</div>
            <Typography level="body-sm">{alert.message}</Typography>
          </div>
        </Alert>
      ))}
    </Stack>
  )
}
