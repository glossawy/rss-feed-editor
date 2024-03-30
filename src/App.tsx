
import { Grid, Stack, Typography } from "@mui/joy"

import { FeedDataProvider } from "@app/components/FeedDataProvider"
import FeedPreviewLink from "@app/components/FeedPreviewLink"
import RulesEditor from "@app/components/RulesEditor"
import DarkModeToggle from "@app/components/DarkModeToggle"

import FeedUrlForm from "./components/FeedUrlForm"

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
