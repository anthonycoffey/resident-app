import React from 'react';
import { Image, View, StyleSheet, ImageSourcePropType } from 'react-native';

interface AvatarProps {
  source: ImageSourcePropType;
  size?: number;
  style?: object;
}

const Avatar: React.FC<AvatarProps> = ({ source, size = 50, style }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Avatar;
