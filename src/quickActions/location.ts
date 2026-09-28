import type { FinderLocationId } from '../components/finder/finderLocations'

export function isProjectsFinderLocation(locationId: FinderLocationId): boolean {
  return locationId === 'projects' || locationId.startsWith('projects-')
}
