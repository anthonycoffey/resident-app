import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { View, Text, useThemeColor } from '../Themed';

type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface ChipProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: ChipVariant;
}

const Chip: React.FC<ChipProps> = ({ label, style, variant = 'primary' }) => {
  const backgroundColor = useThemeColor({}, variant);
  const textColor = useThemeColor(
    { light: '#fff', dark: '#000' },
    'text'
  );

  return (
    <View style={[styles.chip, { backgroundColor }, style]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Chip;
