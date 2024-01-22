import FeedUrlForm from "./components/FeedUrlForm"

import { Grid, Stack, Typography } from "@mui/joy"

import { FeedDataProvider } from "./components/FeedDataProvider"
import FeedPreviewLink from "./components/FeedPreviewLink"
import RulesEditor from "./components/RulesEditor"
import DarkModeToggle from "./components/DarkModeToggle"

function App() {
  return (
    <FeedDataProvider>
      <Stack sx={{ marginY: 4, marginX: 8 }} spacing={2}>
        <Grid container>
          <Grid xs={10}>
            <FeedUrlForm />
          </Grid>
          <Grid xs={2}>
            <DarkModeToggle />
          </Grid>
        </Grid>
        <Stack id="rss-outputs" spacing={0}>
          <Typography level="title-sm">Transformed Feed URL</Typography>
          <FeedPreviewLink />
        </Stack>
        <RulesEditor />
      </Stack>
    </FeedDataProvider>
  )
}

export default App
