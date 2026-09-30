type GreetingPeriod = 'night' | 'morning' | 'afternoon' | 'evening'

type GreetingLine = {
  text: string
  periods?: GreetingPeriod[]
}

const GREETINGS: GreetingLine[] = [
  // —— Anytime: talking to you ——
  { text: 'Hello sunshine.' },
  { text: 'I think I’m starting to like these visits.' },
  { text: 'I saved you a tab. Just kidding.' },
  { text: 'What are we pretending to work on today?' },
  { text: 'Hey, looking good today.' },
  { text: 'Is it hot in here or is that just you?' },
  { text: 'I’m starting to think you open tabs just to see me.' },
  { text: 'What are we pretending to work on today?' },
  { text: 'Another tab?' },
  { text: 'I won’t judge your search, Maybe.' },
  { text: 'Go on, I’m listening.' },
  { text: 'Let’s find something interesting.' },
  { text: 'Take a breath. Then open 17 tabs.' },
  { text: 'I missed you. I’m not dramatic.' },
  { text: 'Go be brilliant or something.' },
  { text: 'I believe in you.' },
  { text: 'You’re awesome. ;)' },
  { text: 'Hi. I was literally just thinking about you.' },
  { text: 'Tell me where to take you. I’ll be honoured.' },
  { text: 'I’d wave if I had hands.' },
  { text: 'I could get used to seeing you here.' },
  { text: 'Let’s find something worth your attention span.' },
  { text: 'You seem busy. Want a tiny adventure anyway?' },

  // —— Night ——
  { text: 'Still awake? Me too.', periods: ['night'] },
  { text: 'It’s late. I won’t tell anyone.', periods: ['night'] },
  { text: 'Okay, one more tab. Then bed.', periods: ['night'] },
  { text: 'Goodnight, friend.', periods: ['night'] },

  // —— Morning ——
  { text: 'Morning? You made it! Proud of you.', periods: ['morning'] },
  { text: 'You’re up early? Suspicious...', periods: ['morning'] },
  { text: 'Good morning, sleepyhead.', periods: ['morning'] },
  { text: 'New day. New tabs.', periods: ['morning'] },

  // —— Afternoon ——
  { text: 'How’s the day treating you?', periods: ['afternoon'] },
  { text: 'A little break never hurt anyone.', periods: ['afternoon'] },
  { text: 'So what are we procrastinating today?', periods: ['afternoon'] },
  { text: 'Drink some water, genius.', periods: ['afternoon'] },

  // —— Evening ——
  { text: 'Evening, friend. What’s the move?', periods: ['evening'] },
  { text: 'Hey, you made it through the day.', periods: ['evening'] },
  { text: 'Golden hour, golden tabs.', periods: ['evening'] },
  { text: 'You’ve done enough for today. Probably.', periods: ['evening'] },
]

function periodFromDate(date: Date): GreetingPeriod {
  const h = date.getHours()
  if (h >= 20 || h < 4) return 'night'
  if (h < 12) return 'morning'
  if (h < 16) return 'afternoon'
  return 'evening'
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export function pickNewTabGreeting(date: Date = new Date()): string {
  const period = periodFromDate(date)
  const pool = GREETINGS.filter((g) => !g.periods || g.periods.includes(period))
  return pickRandom(pool).text
}
