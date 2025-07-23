import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
  FlatList,
  Button,
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/context/NotificationsContext';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import Popover from 'react-native-popover-view';
import { Notification } from '@/lib/context/NotificationsContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markOneAsRead } = useNotifications();
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];
  const touchable = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [showPopover, setShowPopover] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.data?.read),
    [notifications]
  );

  const handleItemPress = (item: Notification) => {
    markOneAsRead(item.id);
    if (item.data?.mobileLink) {
      router.push(item.data.mobileLink);
    }
    setShowPopover(false);
  };

  const handleViewAllPress = () => {
    setShowPopover(false);
    router.push('/(resident)/notifications');
  };

  return (
    <>
      <TouchableOpacity ref={touchable} onPress={() => setShowPopover(true)}>
        <View style={styles.container}>
          <MaterialIcons
            name="notifications-none"
            size={24}
            color={themeColors.text}
          />
          {unreadCount > 0 && (
            <ThemedView style={styles.badge} backgroundColorName="badge">
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
        popoverStyle={{
          backgroundColor: themeColors.card,
          borderRadius: 8,
        }}
      >
        <View style={{ width: 280, maxHeight: 400 }}>
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
                  <Text style={{...styles.popoverTitle, color: themeColors.text}}>{item.title}</Text>
                  <Text style={{color: themeColors.text}}>{item.body}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ ...styles.popoverEmpty, color: themeColors.text }}>
                No unread notifications
              </Text>
            }
          />
          <View style={styles.popoverFooter}>
            <Button title="View all notifications" onPress={handleViewAllPress} />
          </View>
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
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  popoverEmpty: {
    padding: 12,
    textAlign: 'center',
  },
  popoverFooter: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default NotificationBell;
