import React, { useEffect, useState } from 'react';
import { View, Text, useThemeColor } from '@/components/Themed';
import { StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Notification } from '@/lib/types/notification';
import { formatRelativeTime } from '@/lib/utils/dates';
import Colors from '@/constants/Colors';
import Button from './Button';
import {
  claimViolation,
  getViolationDetails,
} from '@/lib/services/violationService';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { Violation } from '@/lib/types/violation';

type NotificationCardProps = {
  notification: Notification;
};

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const mutedColor = useThemeColor({}, 'textMuted');
  const theme = useColorScheme() ?? 'light';
  const { user } = useAuth();
  const router = useRouter();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    const fetchViolation = async () => {
      if (notification.violationId && user?.organizationId && user.propertyId) {
        const violationData = (await getViolationDetails(
          notification.violationId,
          user.organizationId,
          user.propertyId
        )) as Violation;
        if (violationData) {
          setViolation(violationData);
          if (violationData.residentId) {
            setIsClaimed(true);
          }
        }
      }
    };

    fetchViolation();
  }, [notification.violationId, user?.organizationId, user?.propertyId]);

  const handleClaim = async () => {
    if (notification.violationId && user?.uid) {
      await claimViolation(
        notification.violationId,
        user.uid,
        user.organizationId!,
        user.propertyId!
      );
      setIsClaimed(true);
    }
  };

  const handlePress = () => {
    if (notification.violationId) {
      router.push(`/my-violations/${notification.violationId}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        backgroundColorName='card'
        style={[
          styles.card,
          theme === 'light' ? styles.shadowLight : styles.shadowDark,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{notification.title}</Text>
        </View>
        <Text style={styles.message}>{notification.message}</Text>
        <View style={styles.footer}>
          <Text style={[styles.date, { color: mutedColor }]}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        {notification.vehicle &&
          !isClaimed &&
          violation &&
          (violation.status === 'pending' ||
            violation.status === 'reported') && (
          <Button
            title='Claim Unregistered Vehicle'
            onPress={handleClaim}
            style={{ margin: 10 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 0,
    marginVertical: 5,
  },
  header: {
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
