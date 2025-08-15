import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from '../Themed';
import Colors from '@/constants/Colors';

interface BadgeProps {
  label: string;
  onPress: (label: string) => void;
}

const Badge: React.FC<BadgeProps> = ({ label, onPress }) => {
  const textColor = Colors.light.white; // Badge text is almost always white for contrast

  return (
    <TouchableOpacity onPress={() => onPress(label)} style={styles.container}>
      <View style={styles.badge} backgroundColorName='primary'>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
        <MaterialIcons name='close' size={14} color={textColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeText: {
    marginRight: 5,
  },
});

export default Badge;
