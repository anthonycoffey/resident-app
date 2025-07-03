import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

export default function ResidentLayout() {
  const theme = useThemeColor({}, 'text');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === 'dark' ? 'white' : 'black',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="home" color={color} />,
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
        name="service-request/index"
        options={{
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
    </Tabs>
  );
}
