import { v } from 'convex/values'
import { action } from './_generated/server'

export const getPlacesAndDistances = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()), // Make radius optional with a default if not provided
  },
  handler: async (ctx, { latitude, longitude, radius }) => {
    const googleApiKey = `${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
    const stormGlassApiKey = `${process.env.STORMGLASS_IO_API_KEY}`

    // 1. Première étape : Trouver les plages avec l'API Places (searchNearby)
    const placesBody = {
      includedTypes: ['beach'],
      maxResultCount: 5,
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

      const params = 'windSpeed,waveHeight,airTemperature'
      //&start=2019-03-15&end=2019-03-15 ?? to add
      const stormglassWeather = await fetch(
        `https://api.stormglass.io/v2/weather/point?lat=${beach.location.latitude}&lng=${beach.location.longitude}&params=${params}`,
        {
          headers: {
            Authorization: stormGlassApiKey,
          },
        },
      ).then((response) => response.json())

      const stormGlassTide = await fetch(
        `https://api.stormglass.io/v2/tide/extremes/point?lat=${beach.location.latitude}&lng=${beach.location.longitude}&start=2019-03-15&end=2019-03-15`,
        {
          headers: {
            Authorization: stormGlassApiKey,
          },
        },
      ).then((response) => response.json())

      console.log('Weather', stormglassWeather, 'Tide', stormGlassTide)
      return {
        name: beach.displayName.text,
        distance: distance,
        lat: beach.location.latitude,
        long: beach.location.longitude,
      }
    })

    const beachesWithDistance = await Promise.all(beachPromises)
    return beachesWithDistance
  },
})
