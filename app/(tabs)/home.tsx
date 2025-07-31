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

  const [permissionStatus, requestPermission] =
    Location.useForegroundPermissions() // Using foreground permissions is usually sufficient for this use case.
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [closestBeaches, setClosestBeaches] = useState<any[]>([])
  const [placesLoading, setPlacesLoading] = useState<boolean>(false)

  // Use a ref to store the location subscription to unsubscribe later
  type LocationRefType = number | Location.LocationSubscription | null
  const locationSubscriptionRef = useRef<LocationRefType>(null)

  const getPlacesAndDistances = useAction(api.places.getPlacesAndData)

  const setupLocationListener = async () => {
    // Clear any previous errors or state
    setErrorMsg(null)
    setPlacesLoading(true)
    setLocation(null) // Reset location state before starting a new search

    // 1. Request permissions first
    let { status } = permissionStatus || { status: 'undetermined' }
    if (status !== 'granted') {
      const { status: newStatus } = await requestPermission()
      status = newStatus
    }

    // 2. Handle permission denial
    if (status !== 'granted') {
      setErrorMsg(
        'Permission to access location was denied. Please enable it in your device settings.',
      )
      setPlacesLoading(false)
      return
    }

    // 3. If granted, try to get the current location once with a timeout.
    // This is more reliable for a single location fix than a long-running listener.
    // Create a custom timeout promise
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Location request timed out.'))
      }, 20000) // Set your desired timeout here (e.g., 20 seconds)
    })

    try {
      // Race the location promise against the timeout promise
      const currentPosition = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        timeoutPromise,
      ])

      // If the location promise wins the race, the result is assigned here.
      setLocation(currentPosition as Location.LocationObject)
      setErrorMsg(null)
    } catch (e: any) {
      console.log('Error getting current location:', e)
      // This catch block will now handle both location errors and our custom timeout error.
      setErrorMsg(e.message)
      setPlacesLoading(false)
    }
  }

  // 1. Effect for requesting permission and setting up location listener
  useEffect(() => {
    // We only want to run the setup once on component mount.
    // The dependency array is empty, which means it will run only once.
    // We'll call the function directly.
    setupLocationListener()

    // The cleanup function is still important to unsubscribe if a listener was set up
    return () => {
      if (locationSubscriptionRef.current) {
        Platform.select({
          web: () => {
            if (typeof locationSubscriptionRef.current === 'number') {
              navigator.geolocation.clearWatch(locationSubscriptionRef.current)
            }
          },
          default: () => {
            ;(
              locationSubscriptionRef.current as Location.LocationSubscription
            )?.remove()
          },
        })()
        locationSubscriptionRef.current = null
      }
    }
  }, []) // Empty dependency array means this runs only once on mount

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
          setErrorMsg('Failed to fetch beaches. Please try again.')
        } finally {
          setPlacesLoading(false)
        }
      } else {
        setClosestBeaches([])
        // This 'else' block will now only run if location is explicitly null,
        // which might be due to an error, but not during the initial loading state.
      }
    }

    const handler = setTimeout(() => {
      fetchPlaces()
    }, 500) // Debounce for 500ms

    return () => {
      clearTimeout(handler)
    }
  }, [location, getPlacesAndDistances]) // Re-fetch when `location` state changes

  // ... (rest of your render logic remains the same)
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
      {errorMsg && (
        <View>
          <Text style={{ color: 'red' }}>{errorMsg}</Text>
        </View>
      )}
      {placesLoading && !errorMsg ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E0A86A" />
          <Text>Getting your location and finding nearby beaches...</Text>
        </View>
      ) : closestBeaches.length === 0 && !errorMsg ? (
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
            waveInfos,
          }) => {
            const currentHour = new Date().getHours()

            // Find the next upcoming tide event
            const now = new Date()
            const nextTide = tides.find(
              (tide: any) => new Date(tide.tide_time) > now,
            )

            return (
              <View style={styles.cardContainer} key={name}>
                <View style={styles.city}>
                  <Text>{name}</Text>
                </View>
                <View style={styles.dataContainer}>
                  <View>
                    <View style={styles.temp}>
                      <FontAwesome6 name="road" size={12} color="black" />
                      <Text>{distance}</Text>
                    </View>
                    <View style={styles.temp}>
                      <FontAwesome6
                        name="temperature-half"
                        size={12}
                        color="black"
                      />
                      <Text>{temp}°C</Text> <Text>{waveInfos.waterTemp}°C</Text>
                    </View>
                    <View style={styles.temp}>
                      <FontAwesome5 name="wind" size={12} color="black" />
                      <Text>{wind}km/h</Text>
                      <Text>{windDir}</Text>
                    </View>
                  </View>
                  <View>
                    <View style={styles.temp}>
                      <FontAwesome5 name="water" size={12} color="black" />
                      {nextTide ? (
                        <>
                          <Text>{nextTide.tide_type}</Text>
                          <Text>({nextTide.tide_height_mt} m)</Text>
                        </>
                      ) : (
                        <Text>N/A</Text>
                      )}
                    </View>
                    <View style={styles.temp}>
                      <MaterialCommunityIcons
                        name="wave"
                        size={24}
                        color="black"
                      />
                      <Text>
                        {waveInfos && waveInfos[currentHour]
                          ? `${waveInfos[currentHour].swell_ht_mt}m`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          },
        )
      )}
    </ScrollView>
  )
}

// ... (your StyleSheet remains the same)
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#D0D7DA',
    opacity: 0.8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: 768,
    width: '100%',
    marginInline: 'auto',
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
