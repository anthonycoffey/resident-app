import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor, View } from '@/components/Themed';
import NotificationBell from '@/components/ui/NotificationBell';
import { DrawerToggleButton } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { useAuth } from '@/lib/providers/AuthProvider';

function CustomDrawerContent(props: any) {
  const { logout } = useAuth();
  const destructiveColor = useThemeColor({}, 'error');

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={{ borderWidth: 0.5, borderColor: useThemeColor({}, 'divider'), marginVertical: 10 }} />
      <DrawerItem
        label="Logout"
        labelStyle={{ color: destructiveColor }}
        icon={({ color, size }) => (
          <MaterialIcons name="logout" size={size} color={destructiveColor} />
        )}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

export default function ResidentLayout() {
  const activeTintColor = useThemeColor({}, 'tint');
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: activeTintColor,
        headerRight: () => <NotificationBell />,
        headerLeft: () => <DrawerToggleButton tintColor={activeTintColor} />,
      }}
    >
      <Drawer.Screen
        name='index'
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='dashboard' color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='my-profile/index'
        options={{
          title: 'My Profile',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='person' color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='my-property/index'
        options={{
          title: 'My Property',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='apartment' color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='service-request'
        options={{
          // headerShown: false,
          title: 'Service Request',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='build' color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='ai-assistant/index'
        options={{
          title: 'AI Assistant',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='smart-toy' color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='report-violation/index'
        options={{
          title: 'Report Violation',
          drawerIcon: ({ color }) => (
            <MaterialIcons size={28} name='report-problem' color={color} />
          ),
        }}
      />
      {/* Hidden screens will not appear in the drawer */}
      <Drawer.Screen
        name='my-profile/vehicle-modal'
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Vehicle Details',
        }}
      />
      <Drawer.Screen
        name='job/[id]'
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}
