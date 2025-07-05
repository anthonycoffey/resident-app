import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeColor } from '../Themed';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({ style }) => {
  const backgroundColor = useThemeColor({}, 'divider');

  return <View style={[styles.divider, { backgroundColor }, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
});

export default Divider;
