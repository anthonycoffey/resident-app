import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { View, ViewProps } from '../Themed';
import Colors from '@/constants/Colors';

const Card = (props: ViewProps) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <View
      backgroundColorName="card"
      style={[
        styles.card,
        theme === 'light' ? styles.shadowLight : styles.shadowDark,
        props.style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 12,
    padding: 16,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  shadowDark: {
    borderWidth: 1,
    borderColor: Colors.dark.divider,
  },
});

export default Card;
