import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import Button from '@/components/ui/Button';
import { useNotifications } from '@/lib/context/NotificationsContext';
import { Notification } from '@/lib/context/NotificationsContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatDateTime } from '@/lib/utils/dates';
import { useRouter } from 'expo-router';

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
    if (item.data?.mobileLink) {
      router.push(item.data.mobileLink);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isRead = item.data?.read;
    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View
          style={[
            styles.notificationItem,
            { backgroundColor: Colors[colorScheme].card },
            isRead && styles.readItem,
          ]}
        >
          <Text
            style={[
              styles.notificationTitle,
              { color: Colors[colorScheme].text },
            ]}
          >
            {item.title}
          </Text>
          <Text style={{ color: Colors[colorScheme].text }}>{item.body}</Text>
          <Text style={styles.notificationDate}>
            {formatDateTime(item.date) || 'Invalid Date'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.headerButtons}>
        <Button
          title="Mark All as Read"
          onPress={markAllAsRead}
          icon="done-all"
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
      <View style={styles.footer}>
        <Button
          title="Clear All Notifications"
          onPress={handleClearAll}
          variant="destructive"
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
    borderColor: '#ccc',
  },
  notificationItem: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  readItem: {
    opacity: 0.6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
