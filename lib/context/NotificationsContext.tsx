import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from '../providers/AuthProvider';
import { db } from '../config/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  body: string;
  data: any;
  date: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  clearNotifications: () => {},
});

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({
  children,
}: NotificationsProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Handles foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      // You can trigger a local notification here or update the UI directly
    });

    // Handles notifications that opened the app from a background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification
      );
      // Navigate to the correct screen based on remoteMessage.data
    });

    // Check if the app was opened from a quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification
          );
          // Navigate to the correct screen based on remoteMessage.data
        }
      });

    return unsubscribe;
  }, []);

  // fetchResidentProfile(user.uid, user.organizationId, user.propertyId);
  useEffect(() => {
    if (
      user &&
      typeof user.organizationId === 'string' &&
      typeof user.propertyId === 'string' &&
      typeof user.uid === 'string'
    ) {
      const q = query(
        // collection(db, 'users', user.uid, 'notifications'),
        collection(
          db,
          'organizations',
          user.organizationId,
          'properties',
          user.propertyId,
          'residents',
          user.uid,
          'notifications'
        ),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(newNotifications);
        const unread = newNotifications.filter((n) => !n.data.read).length;
        setUnreadCount(unread);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    clearNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
