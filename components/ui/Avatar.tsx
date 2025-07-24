import React from 'react';
import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Assuming FontAwesome is available

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: number;
  style?: object;
}

const Avatar: React.FC<AvatarProps> = ({ source, size = 50, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {source ? (
        <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <FontAwesome name="user" size={size * 0.6} color="#666" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Default background for icon
  },
});

export default Avatar;
