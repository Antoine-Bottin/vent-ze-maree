import FontAwesome from '@expo/vector-icons/FontAwesome'
import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { position: 'absolute' },
        tabBarBackground: () => <BlurView tint="dark" intensity={100} />,
        tabBarActiveTintColor: '#2C4A57',
        tabBarInactiveTintColor: '#7FB3C2',
        animation: 'shift',
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="home" // Corresponds to app/(tabs)/home.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // Corresponds to app/(tabs)/settings.tsx
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
