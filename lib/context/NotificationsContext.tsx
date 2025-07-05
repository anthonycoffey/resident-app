import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../providers/AuthProvider';
import { db } from '../config/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Subscription } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'notifications'),
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

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        // Handle notification received
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        // Handle notification response
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
