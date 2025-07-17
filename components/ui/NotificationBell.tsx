import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  View, // Use default view
} from 'react-native';
import { Text, View as ThemedView } from '@/components/Themed'; // Import themed view separately
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/lib/context/NotificationsContext';
import Popover from 'react-native-popover-view';
import Colors from '@/constants/Colors';

const NotificationBell = () => {
  const { unreadCount, notifications } = useNotifications();
  const [showPopover, setShowPopover] = useState(false);
  const touchable = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const theme = useColorScheme() ?? 'light';
  const themeColors = Colors[theme];

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
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.popoverItem,
                { borderBottomColor: themeColors.divider },
              ]}
            >
              <Text style={styles.popoverTitle} variant="subtitle">
                {item.title}
              </Text>
              <Text>{item.body}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.popoverEmpty}>No notifications</Text>
          }
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
