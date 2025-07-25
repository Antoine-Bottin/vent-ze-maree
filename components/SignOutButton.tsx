import { useClerk } from '@clerk/clerk-expo'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as Linking from 'expo-linking'
import { TouchableOpacity } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      Linking.openURL(Linking.createURL('/'))
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <AntDesign size={28} name="logout" color="#FFC0A0" />
    </TouchableOpacity>
  )
}
