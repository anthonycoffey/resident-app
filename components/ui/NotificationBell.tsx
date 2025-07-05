import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/context/NotificationsContext';
import Popover from 'react-native-popover-view';

const NotificationBell = () => {
  const { unreadCount, notifications } = useNotifications();
  const [showPopover, setShowPopover] = useState(false);
  const touchable = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  return (
    <>
      <TouchableOpacity ref={touchable} onPress={() => setShowPopover(true)}>
        <View style={styles.container}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Popover
        from={touchable as any}
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
      >
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.popoverItem}>
              <Text style={styles.popoverTitle}>{item.title}</Text>
              <Text>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.popoverEmpty}>No notifications</Text>}
        />
      </Popover>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  popoverItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  popoverTitle: {
    fontWeight: 'bold',
  },
  popoverEmpty: {
    padding: 10,
  },
});

export default NotificationBell;
