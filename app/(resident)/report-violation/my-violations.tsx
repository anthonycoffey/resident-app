import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import ViolationList from '@/components/ViolationList';
import { Stack, useRouter } from 'expo-router';
import { useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

const MyReportedViolationsScreen = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'My Reported Violations',
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/report-violation')}
              style={{ paddingHorizontal: 10 }}
            >
              <MaterialIcons name='arrow-back' size={24} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ViolationList />
    </View>
  );
};

export default MyReportedViolationsScreen;
