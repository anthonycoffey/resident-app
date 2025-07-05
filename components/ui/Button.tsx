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
  variant?: 'filled' | 'outline' | 'destructive';
  disabled?: boolean;
}

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'filled',
  disabled = false,
}: ButtonProps) => {
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const isOutline = variant === 'outline';
  const isDestructive = variant === 'destructive';

  const getBackgroundColor = () => {
    if (isOutline) return 'transparent';
    if (isDestructive) return errorColor;
    return primaryColor;
  };

  const getBorderColor = () => {
    if (!isOutline) return 'transparent';
    if (isDestructive) return errorColor;
    return primaryColor;
  };

  const getTextColor = () => {
    if (isOutline) {
      return isDestructive ? errorColor : primaryColor;
    }
    return textColor;
  };

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: isOutline ? 1 : 0,
    },
    style,
    disabled && styles.disabled,
  ];

  const textStyles = [styles.text, { color: getTextColor() }, textStyle];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled}>
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
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;
