import { SignOutButton } from '@/components/SignOutButton'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import globalStyles from './styles/globalStyles'

export default function Page() {
  const { user } = useUser()

  const picture = require('../assets/images/auth-background.png')

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={picture}
          blurRadius={3} // <-- move it here
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <View style={globalStyles.container}>
            {/* <Text
              style={{
                position: 'absolute',
                top: '5%',
                fontFamily: 'Lato',
                fontSize: 60,
                marginBottom: 5,
                color: '#2C4A57',
              }}
            >
              VentZéMarée
            </Text> */}
            {/* <Text
                style={{
                  fontFamily: 'Lato',
                  fontSize: 20,
                  marginBottom: 30,
                  color: '#2C4A57',
                }}
              >
                The first app telling you the best condition for a walk on the
                beach
              </Text> */}

            <SignedIn>
              <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
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
