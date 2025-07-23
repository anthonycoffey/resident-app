import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useAuth } from '../providers/AuthProvider';
import { db } from '../config/firebaseConfig';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  writeBatch,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data: any;
  date: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  clearLocalNotifications: () => void;
  markAllAsRead: () => Promise<void>;
  markOneAsRead: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  clearLocalNotifications: () => {},
  markAllAsRead: async () => {},
  markOneAsRead: async () => {},
  clearAll: async () => {},
  refreshNotifications: async () => {},
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
    const message = messaging();
    // Handles foreground messages
    const unsubscribe = onMessage(message, async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      if (remoteMessage.notification) {
        const newNotification: Notification = {
          id: remoteMessage.messageId || new Date().toISOString(),
          title: remoteMessage.notification.title || 'New Notification',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data || {},
          date: new Date().toISOString(),
        };
        setNotifications((prevNotifications) => [
          newNotification,
          ...prevNotifications,
        ]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Handles notifications that opened the app from a background state
    onNotificationOpenedApp(message, (remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification
      );
      // Navigate to the correct screen based on remoteMessage.data
    });

    // Check if the app was opened from a quit state
    getInitialNotification(message)
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

  const getNotificationsCollection = () => {
    if (
      user &&
      typeof user.organizationId === 'string' &&
      typeof user.propertyId === 'string' &&
      typeof user.uid === 'string'
    ) {
      return collection(
        db,
        'organizations',
        user.organizationId,
        'properties',
        user.propertyId,
        'residents',
        user.uid,
        'notifications'
      );
    }
    return null;
  };

  const refreshNotifications = async () => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) return;

    const q = query(notificationsCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const newNotifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    setNotifications(newNotifications);
    const unread = newNotifications.filter((n) => !n.data.read).length;
    setUnreadCount(unread);
  };

  const markAllAsRead = async () => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) return;

    const batch = writeBatch(db);
    const querySnapshot = await getDocs(notificationsCollection);
    querySnapshot.forEach((document) => {
      batch.update(document.ref, { 'data.read': true });
    });
    await batch.commit();
    refreshNotifications();
  };

  const markOneAsRead = async (notificationId: string) => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) return;

    const notificationRef = doc(notificationsCollection, notificationId);
    await updateDoc(notificationRef, { 'data.read': true });
    refreshNotifications();
  };

  const clearAll = async () => {
    const notificationsCollection = getNotificationsCollection();
    if (!notificationsCollection) return;

    const batch = writeBatch(db);
    const querySnapshot = await getDocs(notificationsCollection);
    querySnapshot.forEach((document) => {
      batch.delete(document.ref);
    });
    await batch.commit();
    refreshNotifications();
  };

  const clearLocalNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    clearLocalNotifications,
    markAllAsRead,
    markOneAsRead,
    clearAll,
    refreshNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
