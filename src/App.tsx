import { CssBaseline, CssVarsProvider, Grid, Stack, Typography } from "@mui/joy"

import DarkModeToggle from "@app/components/DarkModeToggle"
import { FeedDataProvider } from "@app/components/FeedDataProvider"
import FeedDataResetButton from "@app/components/FeedDataResetButton"
import FeedUrlForm from "@app/components/FeedUrlForm"
import RulesEditor from "@app/components/RulesEditor"
import TransformedFeedUrl from "@app/components/TransformedFeedUrl"
import useLocalStorage from "@app/hooks/localStorage"
import { LocalStorageKeys } from "@app/utils/defaults"

import FeedDataImportButton from "./components/FeedDataImportButton"

function App() {
  const [colorMode] = useLocalStorage(LocalStorageKeys.colorMode, "light")

  return (
    <CssVarsProvider
      colorSchemeNode={document.getElementById("joy-target")!}
      colorSchemeSelector="body"
      defaultMode={colorMode}
      disableNestedContext
    >
      <CssBaseline />
      <FeedDataProvider>
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
        </Stack>
      </FeedDataProvider>
    </CssVarsProvider>
  )
}

export default App
