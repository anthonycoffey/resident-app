import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BadgeProps {
  label: string;
  onPress: (label: string) => void;
}

const Badge: React.FC<BadgeProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(label)} style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
      <MaterialIcons name="close" size={14} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2,
  },
  badgeText: {
    color: '#fff',
    marginRight: 5,
  },
});

export default Badge;
