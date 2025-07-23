import { StyleSheet, Text, View } from 'react-native'

const Tab = () => {
  return (
    <View style={styles.container}>
      <Text>Settings </Text>
    </View>
  )
}

export default Tab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
