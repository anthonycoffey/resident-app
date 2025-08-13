import React from 'react';
import { View, Text, useThemeColor } from '@/components/Themed';
import { StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Notification } from '@/lib/types/notification';
import { formatRelativeTime } from '@/lib/utils/dates';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

type NotificationCardProps = {
  notification: Notification;
};

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const mutedColor = useThemeColor({}, 'textMuted');
  const theme = useColorScheme() ?? 'light';
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');

  const handlePress = () => {
    if (notification.violationId) {
      router.push(`/my-violations/${notification.violationId}`);
    }
  };

  const isTappable = !!notification.violationId;

  return (
    <View
      backgroundColorName='card'
      style={[
        styles.card,
        theme === 'light' ? styles.shadowLight : styles.shadowDark,
      ]}
    >
      <TouchableOpacity
        onPress={isTappable ? handlePress : undefined}
        activeOpacity={isTappable ? 0.7 : 1.0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{notification.title}</Text>
          {isTappable && (
            <MaterialIcons
              name='chevron-right'
              size={24}
              color={textColor}
            />
          )}
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <View style={styles.footer}>
          <Text style={[styles.date, { color: mutedColor }]}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 0,
    marginVertical: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  shadowDark: {
    borderWidth: 1,
    borderColor: Colors.dark.divider,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  date: {
    fontSize: 12,
  },
});

export default NotificationCard;
