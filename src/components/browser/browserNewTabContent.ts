import { pickNewTabGreeting } from './browserNewTabGreetings'
import { pickNewTabDesktopTip } from './browserNewTabTips'

export type NewTabPageContent = {
  greeting: string
  tip: string
}

export function createNewTabPageContent(date: Date = new Date()): NewTabPageContent {
  return {
    greeting: pickNewTabGreeting(date),
    tip: pickNewTabDesktopTip(),
  }
}
