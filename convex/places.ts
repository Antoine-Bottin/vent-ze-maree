import { v } from 'convex/values'
import { action } from './_generated/server'

export const getPlacesAndDistances = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radius: v.optional(v.number()), // Make radius optional with a default if not provided
  },
  handler: async (ctx, { latitude, longitude, radius }) => {
    // const centerLatitude = 49.8597888
    // const centerLongitude = 1.0616832
    const googleApiKey = `${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}` // Remplacez par votre VRAIE clé API Google

    // 1. Première étape : Trouver les plages avec l'API Places (searchNearby)
    const placesBody = {
      includedTypes: ['beach'],
      maxResultCount: 5,
      rankPreference: 'DISTANCE', // La Distance Matrix API calculera la distance réelle
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: radius, // Rayon de 50km
        },
      },
    }

    const placesResponse = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': 'places.displayName,places.id,places.location', // Demandez l'ID et le nom d'affichage
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
    console.log('plages', beaches)

    if (!beaches || beaches.length === 0) {
      return [] // Aucune plage trouvée
    }

    // 2. Deuxième étape : Utiliser l'API Distance Matrix pour obtenir les distances
    const origins = [`${latitude},${longitude}`] // Votre point central
    const destinations = beaches.map((beach: any) => `place_id:${beach.id}`) // Les IDs de lieu des plages

    const distanceMatrixResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destinations.join('|')}&key=${googleApiKey}&mode=driving`,
      // Vous pouvez changer 'mode=driving' pour 'walking', 'bicycling', ou 'transit'
    )

    const distanceMatrixResult = await distanceMatrixResponse.json()

    const beachesWithDistance = beaches.map((beach: any, index: number) => {
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

      return {
        name: beach.displayName.text,
        distance: distance,
        lat: beach.location.latitude,
        long: beach.location.longitude,
      }
    })

    return beachesWithDistance
  },
})
