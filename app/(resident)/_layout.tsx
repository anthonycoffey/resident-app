import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import NotificationBell from '@/components/ui/NotificationBell';

export default function ResidentLayout() {
  const theme = useThemeColor({}, 'text');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === 'dark' ? 'white' : 'black',
        headerRight: () => <NotificationBell />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-profile/index"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-property/index"
        options={{
          title: 'My Property',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="apartment" color={color} />,
        }}
      />
      <Tabs.Screen
        name="service-request"
        options={{
          headerShown: false,
          title: 'Service Request',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="build" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant/index"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="smart-toy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-profile/vehicle-modal"
        options={{
          href: null, // Hide this screen from the tab bar
          title: 'Vehicle Details',
        }}
      />
    </Tabs>
  );
}
