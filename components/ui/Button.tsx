import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, useThemeColor, View } from '../Themed';

type ButtonVariant = 'filled' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  destructive?: boolean;
}

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'filled',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  destructive = false,
}: ButtonProps) => {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const errorColor = useThemeColor({}, 'error');
  const whiteColor = useThemeColor({}, 'white');

  const variantStyles = {
    filled: {
      backgroundColor: destructive ? errorColor : primaryColor,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: whiteColor,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: destructive ? errorColor : primaryColor,
      borderWidth: 2,
      textColor: destructive ? errorColor : primaryColor,
    },
    text: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: destructive ? errorColor : secondaryColor,
    },
  };

  const selectedVariant = variantStyles[variant];

  const buttonStyles = [
    styles.button,
    styles[size],
    {
      backgroundColor: selectedVariant.backgroundColor,
      borderColor: selectedVariant.borderColor,
      borderWidth: selectedVariant.borderWidth,
    },
    style,
    (disabled || loading) && styles.disabled,
  ];

  const currentTextColor = selectedVariant.textColor;

  const iconSize = size === 'lg' ? 24 : size === 'md' ? 20 : 16;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={currentTextColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={currentTextColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { color: currentTextColor }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  // Sizes
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
});

export default Button;
