import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/clerk-expo'
import { Text, View } from 'react-native'
import globalStyles from '../styles/globalStyles'

export default function Page() {
  const { user } = useUser()
  console.log(user)

  return (
    <View style={[globalStyles.container, globalStyles.background]}>
      <Text>Home {user?.id}</Text>
      <SignOutButton />
    </View>
  )
}
