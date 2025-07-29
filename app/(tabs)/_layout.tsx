import FontAwesome from '@expo/vector-icons/FontAwesome'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { position: 'absolute', height: 80, borderTopWidth: 0 },
        tabBarBackground: () => <BlurView tint="dark" intensity={100} />,
        tabBarActiveTintColor: '#2C4A57',
        tabBarInactiveTintColor: '#7FB3C2',
        animation: 'shift',
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: { marginBottom: 5 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={40} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={40} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
