import React from "react"
import ReactDOM from "react-dom/client"
import { CssBaseline, CssVarsProvider } from "@mui/joy"
import { QueryClient, QueryClientProvider } from "react-query"

import App from "./App.tsx"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CssVarsProvider
        colorSchemeNode={document.body}
        colorSchemeSelector="body"
        disableNestedContext
      >
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
