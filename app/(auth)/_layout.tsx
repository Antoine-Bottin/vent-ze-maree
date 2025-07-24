import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  console.log('Signed in:', isSignedIn)

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={screenOptions} />
}

const screenOptions = {
  headerShown: false,
}
