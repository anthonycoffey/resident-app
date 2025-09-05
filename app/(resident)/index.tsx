import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/lib/context/NotificationsContext';
import { Notification } from '@/lib/context/NotificationsContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatRelativeTime } from '@/lib/utils/dates';
import { useRouter, Href } from 'expo-router';

export default function NotificationsScreen() {
  const {
    notifications,
    markAllAsRead,
    markOneAsRead,
    clearAll,
    refreshNotifications,
  } = useNotifications();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          onPress: () => clearAll(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleNotificationPress = (item: Notification) => {
    markOneAsRead(item.id);
    if (item.mobileLink) {
      router.push(item.mobileLink as Href);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isRead = item.read;
    const themeColors = Colors[colorScheme];
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View
          style={[
            styles.notificationItem,
            {
              backgroundColor: themeColors.card,
              borderBottomColor: themeColors.divider,
            },
            isRead && styles.readItem,
          ]}
        >
          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, { color: themeColors.text }]}>
              {item.title}
            </Text>
            <Text style={{ color: themeColors.text }}>{item.body}</Text>
            <Text style={[styles.notificationDate, { color: themeColors.textMuted }]}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
          {!isRead && <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.headerButtons}>
        <Button
          title="Mark All as Read"
          onPress={markAllAsRead}
          icon="mark-email-read"
        />
      </View>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onRefresh={refreshNotifications}
        refreshing={false} // This should be managed by a state if you want a loading indicator
        ListEmptyComponent={
          <Text
            style={{
              color: Colors[colorScheme].text,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            No notifications
          </Text>
        }
      />
      <View style={[styles.footer, { borderColor: Colors[colorScheme].divider }]}>
        <Button
          title="Clear All Notifications"
          onPress={handleClearAll}
          variant="filled"
          destructive
          icon="delete-forever"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    padding: 10,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
  },
  notificationItem: {
    padding: 15,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationContent: {
    flex: 1,
  },
  readItem: {
    // You can add specific styles for read items if needed, e.g., different background
  },
  notificationTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '300',
    fontSize: 14,
    marginBottom: 2,
  },
  notificationDate: {
    fontSize: 10,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
});
