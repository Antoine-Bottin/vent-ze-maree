import { useUser } from '@clerk/clerk-expo'
import { Text, View } from 'react-native'

export default function Page() {
  const { user } = useUser()

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings {user?.id}</Text>
    </View>
  )
}
