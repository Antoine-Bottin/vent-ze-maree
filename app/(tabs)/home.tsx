import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/clerk-expo'
import { useAction } from 'convex/react'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import globalStyles from '../styles/globalStyles'

export default function Page() {
  const { user } = useUser()
  const [status, requestPermission] = Location.useBackgroundPermissions()

  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [closestBeaches, setClosestBeaches] = useState<any[]>([])
  const [placesLoading, setPlacesLoading] = useState<boolean>(false)

  const getPlacesAndDistances = useAction(api.places.getPlacesAndDistances)

  useEffect(() => {
    async function getCurrentLocation() {
      // let { status: foregroundStatus } =
      //   await Location.requestForegroundPermissionsAsync()
      // let { status: backgroundStatus } =
      //   await Location.requestBackgroundPermissionsAsync()
      await requestPermission()
      if (status && !status.granted) {
        setErrorMsg('Permission to access location was denied')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
    }

    getCurrentLocation()
  }, [])

  useEffect(() => {
    async function fetchPlaces() {
      setPlacesLoading(true)
      if (location) {
        try {
          const result = await getPlacesAndDistances({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: 50000,
          })
          setClosestBeaches(result || [])
          setPlacesLoading(false)
        } catch (e) {
          console.log(e)
        } finally {
          setPlacesLoading(false) // Ensure loading state is reset
        }
      }
    }
    fetchPlaces()
  }, [location, getPlacesAndDistances])

  return (
    <View style={[globalStyles.background, { flex: 1, padding: 15 }]}>
      {placesLoading && <Text>Loading...</Text>}
      <Text>Home {user?.id}</Text>
      {errorMsg && <Text style={{ color: 'red' }}>{errorMsg}</Text>}
      {closestBeaches.length === 0 && (
        <Text style={{ color: 'orange' }}>
          Aucune plage trouvée ou résultat vide.
        </Text>
      )}
      {closestBeaches.map(({ name, distance, long, lat }) => (
        <View style={styles.cardContainer} key={name}>
          <View style={styles.city}>
            <Text>{name}</Text>
            <Text>{distance}</Text>
            <Text>{lat}</Text>
            <Text>{long}</Text>
          </View>
          <View>
            <Text>Température</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#7FB3C2',
    padding: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  city: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    columnGap: 10,
  },
})
