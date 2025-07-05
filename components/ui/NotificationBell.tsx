import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/context/NotificationsContext';
import Popover from 'react-native-popover-view';

const NotificationBell = () => {
  const { unreadCount, notifications } = useNotifications();
  const [showPopover, setShowPopover] = useState(false);
  const touchable = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const iconColor = useThemeColor({}, 'text');
  const badgeColor = useThemeColor({}, 'badge');
  const popoverBackgroundColor = useThemeColor({}, 'card');
  const dividerColor = useThemeColor({}, 'divider');

  return (
    <>
      <TouchableOpacity ref={touchable} onPress={() => setShowPopover(true)}>
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
          <MaterialIcons name="notifications-none" size={24} color={iconColor} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Popover
        from={touchable as any}
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
        popoverStyle={{ backgroundColor: popoverBackgroundColor, borderRadius: 8 }}
      >
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.popoverItem, { borderBottomColor: dividerColor, backgroundColor: 'transparent' }]}>
              <Text style={styles.popoverTitle}>{item.title}</Text>
              <Text>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.popoverEmpty}>No notifications</Text>}
          style={{ width: 250, maxHeight: 300 }}
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
  },
  popoverTitle: {
    fontWeight: 'bold',
  },
  popoverEmpty: {
    padding: 10,
  },
});

export default NotificationBell;
