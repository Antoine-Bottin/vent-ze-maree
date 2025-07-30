import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/clerk-expo'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useAction } from 'convex/react'
import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react' // Import useRef
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import globalStyles from '../styles/globalStyles'

export default function Page() {
  const { user } = useUser()
  console.log(user?.id)

  const [permissionStatus, requestPermission] =
    Location.useBackgroundPermissions()

  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  console.log('LOCATION', location)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [closestBeaches, setClosestBeaches] = useState<any[]>([])
  const [placesLoading, setPlacesLoading] = useState<boolean>(false)

  // Use a ref to store the location subscription to unsubscribe later
  type LocationRefType = number | Location.LocationSubscription | null
  const locationSubscriptionRef = useRef<LocationRefType>(null)

  const getPlacesAndDistances = useAction(api.places.getPlacesAndDistances)

  // 1. Effect for requesting permission and setting up location listener
  useEffect(() => {
    const setupLocationListener = async () => {
      // Request permissions
      if (permissionStatus === null || !permissionStatus.granted) {
        const { status } = await requestPermission()
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied')
          return
        }
      }

      // If permission is granted (or was already granted), start listening for updates
      if (permissionStatus && permissionStatus.granted) {
        // Clear previous subscription if it exists
        if (locationSubscriptionRef.current) {
          if (Platform.OS === 'web') {
            // On web, if we explicitly assigned a number, it will be a number.
            // But to be safe, we can add a check or rely on the fact we control what's assigned.
            // The simplest cast here is usually safe IF you control the assignment.
            // More robust: ensure it's a number.
            if (typeof locationSubscriptionRef.current === 'number') {
              navigator.geolocation.clearWatch(locationSubscriptionRef.current)
            } else {
              // This case implies an error in logic or unexpected type on web
              console.warn(
                'Expected numeric ID for web clearWatch, got:',
                locationSubscriptionRef.current,
              )
              // Attempt to remove if it has the method (unlikely for web with direct navigator API)
              if (
                (
                  locationSubscriptionRef.current as Location.LocationSubscription
                ).remove
              ) {
                ;(
                  locationSubscriptionRef.current as Location.LocationSubscription
                ).remove()
              }
            }
          } else {
            // On native, it will be a LocationSubscription object
            // Ensure it has the .remove method before calling
            if (
              (locationSubscriptionRef.current as Location.LocationSubscription)
                .remove
            ) {
              ;(
                locationSubscriptionRef.current as Location.LocationSubscription
              ).remove()
            }
          }
          locationSubscriptionRef.current = null
        }

        // Start listening for location updates
        if (Platform.OS === 'web') {
          // On web, watchPosition returns a numeric ID
          locationSubscriptionRef.current = navigator.geolocation.watchPosition(
            (newLocation) => {
              // Convert browser GeolocationPosition to Expo's LocationObject format
              setLocation({
                coords: {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                  altitude: newLocation.coords.altitude,
                  accuracy: newLocation.coords.accuracy,
                  altitudeAccuracy: newLocation.coords.altitudeAccuracy || null,
                  heading: newLocation.coords.heading,
                  speed: newLocation.coords.speed,
                },
                timestamp: newLocation.timestamp,
              })
            },
            (error) => {
              setErrorMsg(error.message)
            },
            {
              // CORRECTED: Use enableHighAccuracy for web
              enableHighAccuracy: true, // Request best possible accuracy for browser
              timeout: 20000,
              maximumAge: 1000,
            },
          )
        } else {
          // On native, expo-location's watchPositionAsync returns the subscription object
          locationSubscriptionRef.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10000 },
            (newLocation) => {
              setLocation(newLocation)
            },
          )
        }
      }
    }

    setupLocationListener()

    // Cleanup function: important to unsubscribe from location updates
    return () => {
      if (locationSubscriptionRef.current) {
        Platform.select({
          web: () => {
            navigator.geolocation.clearWatch(
              locationSubscriptionRef.current as number,
            )
          },
          default: () => {
            ;(
              locationSubscriptionRef.current as Location.LocationSubscription
            ).remove()
          },
        })() // Immediately invoke the selected function
        locationSubscriptionRef.current = null
      }
    }
  }, [permissionStatus, requestPermission]) // Re-run if permission status or requestPermission function changes

  // 2. Effect for fetching places when location changes
  useEffect(() => {
    async function fetchPlaces() {
      if (location) {
        // Only fetch if location is available
        setPlacesLoading(true)
        try {
          const result = await getPlacesAndDistances({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: 50000,
          })
          setClosestBeaches(result || [])
        } catch (e) {
          console.log('Error fetching places:', e)
          // Consider showing an error message to the user
        } finally {
          setPlacesLoading(false) // Ensure loading state is reset
        }
      } else {
        // Optionally, reset beaches or show a message if location is null
        setClosestBeaches([])
        setPlacesLoading(false)
      }
    }

    // Debounce or throttle API calls if location changes very frequently
    // This is crucial for performance and API limits
    const handler = setTimeout(() => {
      fetchPlaces()
    }, 500) // Wait 500ms after last location change before fetching

    return () => {
      clearTimeout(handler) // Clear timeout if location changes again quickly
    }
  }, [location, getPlacesAndDistances]) // Re-fetch when `location` state changes

  return (
    <ScrollView
      style={[
        globalStyles.background,
        { flex: 1, padding: 15, paddingBottom: 60 },
      ]}
    >
      <View>
        <Text>LOCAL INFOS</Text>
      </View>
      {errorMsg && <Text style={{ color: 'red' }}>{errorMsg}</Text>}
      {placesLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E0A86A" />
        </View>
      ) : closestBeaches.length === 0 ? ( // Only show "no beaches" if not loading AND no beaches found
        <Text style={{ color: 'orange' }}>
          Aucune plage trouvée ou résultat vide.
        </Text>
      ) : (
        closestBeaches.map(
          ({
            name,
            distance,
            long,
            lat,
            temp,
            condition,
            tides,
            icon,
            wind,
            windDir,
            humidity,
          }) => (
            <View style={styles.cardContainer} key={name}>
              <View style={styles.city}>
                <Text>{name}</Text>
              </View>
              <View style={styles.dataContainer}>
                <View>
                  <View style={styles.temp}>
                    <FontAwesome6 name="road" size={12} color="black" />{' '}
                    <Text>{distance}</Text>
                  </View>
                  <View style={styles.temp}>
                    <FontAwesome6
                      name="temperature-half"
                      size={12}
                      color="black"
                    />{' '}
                    <Text>{temp}°C</Text>
                  </View>
                  <View style={styles.temp}>
                    <FontAwesome5 name="wind" size={12} color="black" />{' '}
                    <Text>{wind}km/h</Text>
                  </View>
                </View>
                <View>
                  <View style={styles.temp}>
                    <FontAwesome5 name="water" size={12} color="black" />{' '}
                    <Text>High</Text>
                  </View>
                  <View style={styles.temp}>
                    <MaterialCommunityIcons
                      name="wave"
                      size={24}
                      color="black"
                    />
                    {tides.map(
                      ({
                        tide_time,
                        tide_height,
                        tide_type,
                      }: {
                        tide_time: string
                        tide_height: string
                        tide_type: string
                      }) => {
                        return (
                          <View key={tide_time}>
                            <Text>{tide_time}</Text>
                            <Text>{tide_height}</Text>
                            <Text>{tide_type}</Text>
                          </View>
                        )
                      },
                    )}
                  </View>
                </View>
              </View>
            </View>
          ),
        )
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#D0D7DA',
    opacity: 0.8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  dataContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  city: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    columnGap: 10,
    marginBottom: 10,
  },
  temp: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
