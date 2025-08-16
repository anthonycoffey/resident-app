import React, { useState, useEffect } from 'react';
import { View, Text } from '@/components/Themed';
import { StyleSheet } from 'react-native';
import { Timestamp } from 'firebase/firestore';

interface CountdownTimerProps {
  createdAt: Timestamp;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutes = 5 * 60 * 1000;
      const createdDate = createdAt.toDate().getTime();
      const now = new Date().getTime();
      const difference = createdDate + fiveMinutes - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('00:00');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time left:</Text>
      <Text style={styles.timer}>{timeLeft}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default CountdownTimer;
