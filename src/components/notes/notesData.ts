export type NoteSection = 'Today' | 'Archived'

export type NoteItem = {
  id: string
  section: NoteSection
  title: string
  preview: string
  /** Sidebar meta line (time or date) */
  meta: string
  /** Full editor timestamp */
  editedAt: string
  body: string
}

export const SAMPLE_NOTES: NoteItem[] = [
  {
    id: 'note-today',
    section: 'Today',
    title: 'New note',
    meta: '6:31 PM',
    editedAt: '30 September 2026 at 6:31 PM',
    preview: '',
    body: '',
  },
  {
    id: 'note-1',
    section: 'Archived',
    title: 'Sample note 1',
    meta: '18/08/26',
    editedAt: '18 August 2026 at 3:14 PM',
    preview: 'Sample text 1',
    body: 'Sample text 1',
  },
  {
    id: 'note-2',
    section: 'Archived',
    title: 'Sample note 2',
    meta: '12/09/26',
    editedAt: '12 September 2026 at 9:48 AM',
    preview: 'Sample text 2',
    body: 'Sample text 2',
  },
]

export const NOTE_SECTION_ORDER: NoteSection[] = ['Today', 'Archived']

export function notesBySection(notes: NoteItem[]): Map<NoteSection, NoteItem[]> {
  const map = new Map<NoteSection, NoteItem[]>()
  for (const section of NOTE_SECTION_ORDER) {
    const items = notes.filter((n) => n.section === section)
    if (items.length) map.set(section, items)
  }
  return map
}
