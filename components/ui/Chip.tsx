import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { View, Text } from '../Themed';

interface ChipProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

const Chip: React.FC<ChipProps> = ({ label, style }) => {
  return (
    <View style={[styles.chip, style]} backgroundColorName="chip">
      <Text style={styles.label}>{label}</Text>
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
