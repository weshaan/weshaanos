import { pickNewTabGreeting } from './braveNewTabGreetings'
import { pickNewTabDesktopTip } from './braveNewTabTips'

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
