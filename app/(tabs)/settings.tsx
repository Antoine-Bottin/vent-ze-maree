import { useUser } from '@clerk/clerk-expo'
import { Text, View } from 'react-native'

export default function Page() {
  const { user } = useUser()

  return (
    <View>
      <Text>Settings {user?.id}</Text>
    </View>
  )
}
