import { SignOutButton } from '@/components/SignOutButton'
import { useUser } from '@clerk/clerk-expo'
import Slider from '@react-native-community/slider'
import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import globalStyles from '../styles/globalStyles'

export default function Page() {
  const { user } = useUser()

  const [isTideHigh, setIsTideHigh] = useState(false)
  const toggleSwitch = () => setIsTideHigh((previousState) => !previousState)

  console.log(isTideHigh)

  console.log(user?.id)

  return (
    <View style={[globalStyles.container, globalStyles.background]}>
      <View style={styles.slider}>
        <Text>Location radius (km)</Text>{' '}
        <Slider
          style={{ width: 300, height: 60 }}
          minimumValue={0}
          maximumValue={5}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          renderStepNumber={true}
          step={1}
        />
      </View>
      <View style={styles.slider}>
        <Text>Wind force (km/h)</Text>{' '}
        <Slider
          style={{ width: 300, height: 60 }}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          renderStepNumber={true}
          step={10}
        />
      </View>
      <View style={styles.slider}>
        <Text>Air temperature (°C)</Text>{' '}
        <Slider
          style={{ width: 300, height: 60 }}
          minimumValue={0}
          maximumValue={50}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          renderStepNumber={true}
          step={5}
        />
      </View>
      <View style={styles.slider}>
        <Text>Water temperature (°C)</Text>{' '}
        <Slider
          style={{ width: 300, height: 60 }}
          minimumValue={0}
          maximumValue={50}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          renderStepNumber={true}
          step={5}
        />
      </View>
      <View style={styles.slider}>
        <Text>Tide</Text>{' '}
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isTideHigh ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isTideHigh}
        />
      </View>

      <SignOutButton />
    </View>
  )
}

const styles = StyleSheet.create({
  slider: {
    alignItems: 'center',
  },
})
