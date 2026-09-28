import type { WeatherIconKind } from '../weather/wmoWeather'
import {
  CloudIcon,
  MoonIcon,
  PartlyCloudyIcon,
  RainIcon,
  SnowIcon,
  SunIcon,
  ThunderIcon,
} from './icons/WeatherSymbols'

type Props = {
  kind: WeatherIconKind
  size?: number
}

export function WeatherIcon({ kind, size = 22 }: Props) {
  switch (kind) {
    case 'clear-day':
      return <SunIcon size={size} />
    case 'clear-night':
      return <MoonIcon size={size} />
    case 'partly':
      return <PartlyCloudyIcon size={size} />
    case 'cloud':
    case 'fog':
      return <CloudIcon size={size} />
    case 'rain':
      return <RainIcon size={size} />
    case 'snow':
      return <SnowIcon size={size} />
    case 'thunder':
      return <ThunderIcon size={size} />
    default:
      return <PartlyCloudyIcon size={size} />
  }
}
