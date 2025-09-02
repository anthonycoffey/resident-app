import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
  FlatList,
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/context/NotificationsContext';
import Colors from '@/constants/Colors';
import { useRouter, Href } from 'expo-router';
import Popover from 'react-native-popover-view';
import { Notification } from '@/lib/context/NotificationsContext';
import { formatRelativeTime } from '@/lib/utils/dates';

const NotificationBell = () => {
  const { notifications, unreadCount, markOneAsRead } = useNotifications();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const touchable = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [showPopover, setShowPopover] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read),
    [notifications]
  );

  const handleItemPress = (item: Notification) => {
    markOneAsRead(item.id);
    if (item.mobileLink) {
      router.push(item.mobileLink as Href);
    }
    setShowPopover(false);
  };

  const handleViewAllPress = () => {
    setShowPopover(false);
    router.push('/(resident)');
  };

  return (
    <>
      <TouchableOpacity ref={touchable} onPress={() => setShowPopover(true)}>
        <View style={styles.container}>
          <MaterialIcons
            name='notifications-none'
            size={24}
            color={themeColors.text}
          />
          {unreadCount > 0 && (
            <ThemedView style={styles.badge} backgroundColorName='badge'>
              <Text
                style={styles.badgeText}
                lightColor={Colors.light.white}
                darkColor={Colors.dark.white}
              >
                {unreadCount}
              </Text>
            </ThemedView>
          )}
        </View>
      </TouchableOpacity>
      <Popover
        from={touchable as any}
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
        popoverStyle={[
          styles.popover,
          {
            backgroundColor: themeColors.card,
          },
        ]}
      >
        <View style={{ width: 320, maxHeight: 400 }}>
          <FlatList
            data={unreadNotifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleItemPress(item)}>
                <View
                  style={[
                    styles.popoverItem,
                    { borderBottomColor: themeColors.divider },
                  ]}
                >
                  <Text
                    style={{
                      ...styles.popoverTitle,
                      color: themeColors.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ color: themeColors.text }}>{item.body}</Text>
                  <Text
                    style={{
                      ...styles.timestamp,
                      color: themeColors.textMuted,
                    }}
                  >
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ ...styles.popoverEmpty, color: themeColors.text }}>
                No unread notifications
              </Text>
            }
          />
          <TouchableOpacity onPress={handleViewAllPress}>
            <View
              style={[
                styles.popoverFooter,
                { borderTopColor: themeColors.divider },
              ]}
            >
              <Text style={{ color: themeColors.primary }}>
                View all notifications
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
    padding: 12,
    borderBottomWidth: 1,
  },
  popoverTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '300',
    fontSize: 14,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  popoverEmpty: {
    padding: 12,
    textAlign: 'center',
  },
  popoverFooter: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  popover: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NotificationBell;
