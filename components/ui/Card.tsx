import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeColor } from '../Themed';

const Card = (props: ViewProps) => {
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1C1C1E' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#3A3A3C' }, 'tabIconDefault');

  return (
    <View
      style={[
        styles.card,
        { backgroundColor, borderColor },
        props.style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;
