import type { WeatherLocation } from './types'

export const DEFAULT_WEATHER_LOCATIONS: WeatherLocation[] = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    isPrimary: true,
  },
  {
    id: 'new-delhi',
    name: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: 'miami',
    name: 'Miami',
    region: 'Florida',
    country: 'United States',
    latitude: 25.7617,
    longitude: -80.1918,
  },
]
