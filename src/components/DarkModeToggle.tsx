import { Box, IconButton, useColorScheme } from "@mui/joy"
import * as Icons from "@mui/icons-material"
import { useCallback } from "react"

export default function DarkModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()

  const currentMode = mode === "system" ? systemMode : mode
  const otherMode = mode === "light" ? "dark" : "light"

  const changeMode = useCallback(() => {
    setMode(otherMode)
  }, [setMode, otherMode])

  return (
    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "end" }}>
      <div>
        <IconButton
          onClick={changeMode}
          size="lg"
          title={`Toggle to ${otherMode} mode`}
        >
          {currentMode === "light" ? <Icons.LightMode /> : <Icons.DarkMode />}
        </IconButton>
      </div>
    </Box>
  )
}
