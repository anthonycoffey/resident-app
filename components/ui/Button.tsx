import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColor } from '../Themed';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'filled' | 'outline';
}

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'filled',
}: ButtonProps) => {
  const primaryColor = useThemeColor(
    { light: '#007BFF', dark: '#007BFF' },
    'tint'
  );
  const textColor = useThemeColor(
    { light: '#FFFFFF', dark: '#FFFFFF' },
    'text'
  );

  const isOutline = variant === 'outline';

  // Extract border color from style prop, if it exists
  const flatStyle = StyleSheet.flatten(style);
  const borderColorFromStyle = flatStyle?.borderColor;

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: isOutline ? 'transparent' : primaryColor,
      borderColor: isOutline ? borderColorFromStyle || primaryColor : 'transparent',
      borderWidth: isOutline ? 1 : 0,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    { color: isOutline ? borderColorFromStyle || primaryColor : textColor },
    textStyle,
  ];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
