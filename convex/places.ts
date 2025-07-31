import { v } from 'convex/values'
import { action } from './_generated/server'

export const getCurrentData = action({
  args: { latitude: v.number(), longitude: v.number() },
  handler: (ctx, { latitude, longitude }) => {
    // do something with `args.a` and `args.b`

    // optionally return a value
    return 'success'
  },
})
export const getPlacesAndData = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()), // Make radius optional with a default if not provided
  },
  handler: async (ctx, { latitude, longitude, radius }) => {
    const googleApiKey = `${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
    const weatherAPIKey = `${process.env.WEATHERAPI_API_KEY}`

    // 1. Première étape : Trouver les plages avec l'API Places (searchNearby)
    const placesBody = {
      includedTypes: ['beach'],
      maxResultCount: 8,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: radius,
        },
      },
    }

    const placesResponse = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.location',
        },
        method: 'POST',
        body: JSON.stringify(placesBody),
      },
    )

    if (!placesResponse.ok) {
      // Gérer l'erreur HTTP, par exemple en loggant et en retournant une erreur
      const errorBody = await placesResponse.text() // ou .json() si l'API retourne du JSON d'erreur
      console.error(
        "Erreur lors de l'appel à Places API:",
        placesResponse.status,
        errorBody,
      )
      throw new Error("Échec de la récupération des lieux depuis l'API Places.")
    }

    const placesResult = await placesResponse.json()
    const beaches = placesResult.places

    if (!beaches || beaches.length === 0) {
      return []
    }

    // 2. Deuxième étape : Utiliser l'API Distance Matrix pour obtenir les distances
    const origins = [`${latitude},${longitude}`] // Votre point central
    const destinations = beaches.map((beach: any) => `place_id:${beach.id}`) // Les IDs de lieu des plages

    const distanceMatrixResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destinations.join('|')}&key=${googleApiKey}&mode=driving`,
      // Vous pouvez changer 'mode=driving' pour 'walking', 'bicycling', ou 'transit'
    )

    const distanceMatrixResult = await distanceMatrixResponse.json()

    const beachPromises = beaches.map(async (beach: any, index: number) => {
      let distance = 'N/A'
      // Vérifier si la réponse de Distance Matrix est valide et contient l'information
      if (
        distanceMatrixResult.rows &&
        distanceMatrixResult.rows[0] &&
        distanceMatrixResult.rows[0].elements &&
        distanceMatrixResult.rows[0].elements[index] &&
        distanceMatrixResult.rows[0].elements[index].distance
      ) {
        distance = distanceMatrixResult.rows[0].elements[index].distance.text
      }

      //WeatherAPI
      const latAndLong = `${beach.location.latitude},${beach.location.longitude}`
      const currentWeatherAPIResponse = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${latAndLong}`,
      )

      if (!currentWeatherAPIResponse.ok) {
        // IMPORTANT: Consume the response body even on error
        const errorBody = await currentWeatherAPIResponse.text() // Or .json() if the error is JSON formatted
        console.error(
          "Erreur lors de l'appel à WeatherAPI:",
          currentWeatherAPIResponse.status,
          errorBody, // Log the actual error body for better debugging
        )
        throw new Error('Échec de la récupération des données météo.')
      }

      // Only if response.ok, then parse JSON
      const weatherData = await currentWeatherAPIResponse.json()

      //MarineAPI
      const marineAPIResponse = await fetch(
        `https://api.weatherapi.com/v1/marine.json?key=${weatherAPIKey}&q=${latAndLong}`,
      )

      if (!marineAPIResponse.ok) {
        // IMPORTANT: Consume the response body even on error
        const errorBody = await currentWeatherAPIResponse.text() // Or .json() if the error is JSON formatted
        console.error(
          "Erreur lors de l'appel à WeatherAPI:",
          currentWeatherAPIResponse.status,
          errorBody, // Log the actual error body for better debugging
        )
        throw new Error('Échec de la récupération des données météo.')
      }

      // Only if response.ok, then parse JSON
      const marineData = await marineAPIResponse.json()
      const computedMarineData = marineData.forecast.forecastday[0].day
      const waveHourlyInfos = marineData.forecast.forecastday[0].hour
      const tides = computedMarineData.tides[0].tide

      return {
        name: beach.displayName.text,
        distance: distance,
        lat: beach.location.latitude,
        long: beach.location.longitude,
        temp: weatherData.current.temp_c, // Assuming you want the temperature in Celsius
        condition: weatherData.current.condition.text, // Weather condition text
        icon: weatherData.current.condition.icon, // Weather condition icon URL
        wind: weatherData.current.wind_kph, // Wind speed in km/h
        windDir: weatherData.current.wind_dir, // Wind direction
        humidity: weatherData.current.cloud,
        tides: tides,
        waveInfos: waveHourlyInfos,
      }
    })

    const beachesWithData = await Promise.all(beachPromises)
    return beachesWithData
  },
})
