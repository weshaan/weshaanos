import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QuickActionsProvider } from './context/QuickActionsContext.tsx'
import { WindowThemeProvider } from './context/WindowThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WindowThemeProvider>
      <QuickActionsProvider>
        <App />
      </QuickActionsProvider>
    </WindowThemeProvider>
  </StrictMode>,
)
