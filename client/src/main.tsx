import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { store } from './store'
import { Provider } from 'react-redux'

import { ThemeProvider } from "@/components/theme-provider"

import { initializeApi } from '@/lib/api'

initializeApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </Provider>
    </StrictMode>,
  )
})
