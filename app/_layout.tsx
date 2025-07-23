import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { Slot } from 'expo-router'

export default function TabLayout() {
  const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
  })

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ConvexProvider client={convex}>
        <Slot />
      </ConvexProvider>
    </ClerkProvider>
  )
}
