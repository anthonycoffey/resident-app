import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColor } from '../Themed';

interface BadgeProps {
  label: string;
  onPress: (label: string) => void;
}

const Badge: React.FC<BadgeProps> = ({ label, onPress }) => {
  const badgeColor = useThemeColor({}, 'badge');
  const textColor = '#fff'; // Badges typically have white text for contrast

  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      style={[styles.badge, { backgroundColor: badgeColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
      <MaterialIcons name="close" size={14} color={textColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 2,
  },
  badgeText: {
    marginRight: 5,
  },
});

export default Badge;
