import * as Icons from "@mui/icons-material"
import { Box, IconButton, useColorScheme } from "@mui/joy"
import { useCallback } from "react"

import useLocalStorage from "@app/hooks/localStorage"
import { LocalStorageKeys } from "@app/utils/defaults"

export default function DarkModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const [savedMode, setSavedMode] = useLocalStorage(
    LocalStorageKeys.colorMode,
    systemMode || "light"
  )

  const otherMode = mode === "light" ? "dark" : "light"

  const changeMode = useCallback(() => {
    setMode(otherMode)
    setSavedMode(otherMode)
  }, [setMode, setSavedMode, otherMode])

  return (
    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "end" }}>
      <div>
        <IconButton
          onClick={changeMode}
          size="lg"
          title={`Toggle to ${otherMode} mode`}
        >
          {savedMode === "light" ? <Icons.LightMode /> : <Icons.DarkMode />}
        </IconButton>
      </div>
    </Box>
  )
}
