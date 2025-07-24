import { SignOutButton } from '@/components/SignOutButton'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { ImageBackground, Text, View } from 'react-native'
import globalStyles from './styles/globalStyles'

export default function Page() {
  const { user } = useUser()

  const picture = require('../assets/images/auth-background.png')

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <ImageBackground
        source={picture}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <View style={globalStyles.container}>
          <SignedIn>
            <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
            <SignOutButton />
          </SignedIn>
          <SignedOut>
            <View style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
              <Link href="/(auth)/sign-in">
                <Text style={globalStyles.signInButton}>Sign in</Text>
              </Link>
              <Link href="/(auth)/sign-up">
                <Text style={globalStyles.signUpButton}>Sign up</Text>
              </Link>
            </View>
          </SignedOut>
        </View>
      </ImageBackground>
    </View>
  )
}
