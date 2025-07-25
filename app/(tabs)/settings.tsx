import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/clerk-expo'
import Slider from '@react-native-community/slider'
import { View } from 'react-native'
import globalStyles from '../styles/globalStyles'

export default function Page() {
  const { user } = useUser()

  return (
    <View style={[globalStyles.container, globalStyles.background]}>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
      />
      <SignOutButton />
    </View>
  )
}
