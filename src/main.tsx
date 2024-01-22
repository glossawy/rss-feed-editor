import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import { CssBaseline, CssVarsProvider } from "@mui/joy"
import { QueryClientProvider, QueryClient } from "react-query"

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
