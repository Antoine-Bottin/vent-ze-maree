import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  // Needed to remove white background on input for Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style')
      style.innerHTML = `
      input:-webkit-autofill,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px #5F9EA0 inset !important;
        box-shadow: 0 0 0 1000px #5F9EA0 inset !important;
        background-color: #5F9EA0 !important;
        color: inherit !important;
        transition: background-color 5000s ease-in-out 0s !important;
      }
    `
      document.head.appendChild(style)
      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  if (isSignedIn) {
    return <Redirect href={'/'} />
  }

  return <Stack screenOptions={screenOptions} />
}

const screenOptions = {
  headerShown: false,
}
