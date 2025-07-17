import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { View } from '../Themed';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({ style }) => {
  return (
    <View style={[styles.divider, style]} backgroundColorName="divider" />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
});

export default Divider;
