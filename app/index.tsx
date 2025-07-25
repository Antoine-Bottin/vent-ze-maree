import { SignOutButton } from '@/components/SignOutButton'
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import globalStyles from './styles/globalStyles'

export default function Page() {
  const { user } = useUser()

  const { isSignedIn } = useAuth()
  console.log('Signed in:', isSignedIn)

  const backgroundPicture = require('../assets/images/auth-background.png')
  // const appLogo = require('../assets/images/app-logo.png')

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={backgroundPicture}
          blurRadius={2} // <-- move it here
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <View style={globalStyles.container}>
            {/* <Image
              style={{ flex: 1, width: '100%', backgroundColor: 'transparent' }}
              source={appLogo}
              placeholder={{ blurhash }}
              contentFit="contain"
              transition={1000}
            /> */}
            <SignedIn>
              <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
              <Link href="/home">Continue</Link>
              <SignOutButton />
            </SignedIn>
            <SignedOut>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <Pressable style={globalStyles.signInButton}>
                  <Link href="/(auth)/sign-in">
                    <Text>Sign in </Text>
                  </Link>
                </Pressable>
                <View style={{ height: 50 }} />
                <Pressable style={globalStyles.signUpButton}>
                  <Link href="/(auth)/sign-up">
                    <Text>Sign up</Text>
                  </Link>
                </Pressable>
              </View>
            </SignedOut>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  )
}
