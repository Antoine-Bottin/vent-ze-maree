import FontAwesome from '@expo/vector-icons/FontAwesome'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'
import { Platform, StyleSheet, View } from 'react-native'

export default function Layout() {
  return (
    <Tabs
      // screenOptions={{
      //   tabBarStyle: {
      //     position: 'absolute',
      //     height: 80,
      //     borderTopWidth: 0,
      //     zIndex: 999,
      //   },
      //   tabBarBackground: () => <BlurView tint="light" intensity={50} />,
      //   tabBarActiveTintColor: '#2C4A57',
      //   tabBarInactiveTintColor: '#7FB3C2',
      //   animation: 'shift',
      //   tabBarLabelPosition: 'below-icon',
      //   tabBarIconStyle: { marginBottom: 5 },
      // }}
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          height: 60,
          borderTopWidth: 0,
          // On web, ensure it's on top of content.
          // And potentially allow pointer events through if you have clickable items below.
          zIndex: 999, // Ensure it's above other content
        },
        tabBarBackground: () => {
          // Platform-specific rendering for BlurView or a fallback
          if (Platform.OS === 'ios' || Platform.OS === 'web') {
            // iOS and Web (with backdrop-filter support) usually handle BlurView well
            return (
              <BlurView
                tint="dark" // "light" or "dark"
                intensity={50} // Adjust intensity as needed
                style={StyleSheet.absoluteFill} // Makes BlurView fill its parent (tabBarBackground)
              />
            )
          } else if (Platform.OS === 'android') {
            // Android fallback: A semi-transparent colored view
            // True blur is tricky on Android without heavy performance impact or specific libraries.
            console.warn(
              'BlurView on Android might not appear as expected. Using a semi-transparent fallback.',
            )
            return (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)', // White with 70% opacity
                }}
              />
            )
          }
          return null // Fallback for unknown platforms
        },
        tabBarActiveTintColor: '#2C4A57',
        tabBarInactiveTintColor: '#7FB3C2',
        animation: 'shift', // This is for screen transitions, not tab bar itself
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: { padding: 5 },
        // Ensure screen content extends under the tab bar,
        // and provide padding so content isn't hidden by the fixed tab bar.
        tabBarHideOnKeyboard: true, // Good practice
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={25} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={25} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
