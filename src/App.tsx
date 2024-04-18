import { CssBaseline, CssVarsProvider, Grid, Stack, Typography } from "@mui/joy"

import AlertProvider from "@app/components/AlertProvider"
import DarkModeToggle from "@app/components/DarkModeToggle"
import FeedDataImportButton from "@app/components/FeedDataImportButton"
import { FeedTransformProvider } from "@app/components/FeedDataProvider"
import FeedDataResetButton from "@app/components/FeedDataResetButton"
import FeedUrlForm from "@app/components/FeedUrlForm"
import PopupAlertDisplay from "@app/components/PopupAlertDisplay"
import RulesEditor from "@app/components/RulesEditor"
import TransformedFeedUrl from "@app/components/TransformedFeedUrl"
import useLocalStorage from "@app/hooks/localStorage"
import { LocalStorageKeys } from "@app/utils/defaults"

function App() {
  const [colorMode] = useLocalStorage(LocalStorageKeys.colorMode, "system")

  return (
    <CssVarsProvider
      colorSchemeNode={document.getElementById("joy-target")!}
      colorSchemeSelector="body"
      defaultMode={colorMode}
      disableNestedContext
    >
      <CssBaseline />
      <FeedTransformProvider>
        <AlertProvider>
          <Stack sx={{ marginY: 4, marginX: 8 }} spacing={2}>
            <Grid container>
              <Grid xs={10}>
                <FeedUrlForm />
              </Grid>
              <Grid xs={2}>
                <Stack direction="row-reverse">
                  <DarkModeToggle />
                  <FeedDataResetButton />
                  <FeedDataImportButton />
                </Stack>
              </Grid>
            </Grid>
            <Stack id="rss-outputs" spacing={0}>
              <Typography level="title-sm">Transformed Feed URL</Typography>
              <TransformedFeedUrl />
            </Stack>
            <RulesEditor />
            <PopupAlertDisplay />
          </Stack>
        </AlertProvider>
      </FeedTransformProvider>
    </CssVarsProvider>
  )
}

export default App
