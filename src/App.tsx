import { CssBaseline, CssVarsProvider, Grid, Stack, Typography } from "@mui/joy"

import { FeedDataProvider } from "@app/components/FeedDataProvider"
import FeedPreviewLink from "@app/components/FeedPreviewLink"
import RulesEditor from "@app/components/RulesEditor"
import DarkModeToggle from "@app/components/DarkModeToggle"
import FeedUrlForm from "@app/components/FeedUrlForm"
import useLocalStorage from "@app/hooks/localStorage"
import { LocalStorageKeys } from "@app/utils/defaults"
import FeedDataResetButton from "@app/components/FeedDataResetButton"

function App() {
  const [colorMode] = useLocalStorage(LocalStorageKeys.colorMode, "light")

  return (
    <CssVarsProvider
      colorSchemeNode={document.body}
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
              </Stack>
            </Grid>
          </Grid>
          <Stack id="rss-outputs" spacing={0}>
            <Typography level="title-sm">Transformed Feed URL</Typography>
            <FeedPreviewLink />
          </Stack>
          <RulesEditor />
        </Stack>
      </FeedDataProvider>
    </CssVarsProvider>
  )
}

export default App
