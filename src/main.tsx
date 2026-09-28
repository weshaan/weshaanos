import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClockWidgetProvider } from './context/ClockWidgetContext.tsx'
import { QuickActionsProvider } from './context/QuickActionsContext.tsx'
import { WindowThemeProvider } from './context/WindowThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WindowThemeProvider>
      <ClockWidgetProvider>
        <QuickActionsProvider>
          <App />
        </QuickActionsProvider>
      </ClockWidgetProvider>
    </WindowThemeProvider>
  </StrictMode>,
)
