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

type ButtonVariant = 'filled' | 'outline' | 'destructive' | 'ghost';
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
}: ButtonProps) => {
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const errorColor = useThemeColor({}, 'error');
  const cardColor = useThemeColor({}, 'card');
  const textColorLight = useThemeColor({ light: '#fff', dark: '#000' }, 'text');

  const isOutline = variant === 'outline';
  const isDestructive = variant === 'destructive';
  const isGhost = variant === 'ghost';

  const getBackgroundColor = () => {
    if (isOutline || isGhost) return 'transparent';
    if (isDestructive) return errorColor;
    return primaryColor;
  };

  const getBorderColor = () => {
    if (!isOutline) return 'transparent';
    if (isDestructive) return errorColor;
    return secondaryColor;
  };

  const getTextColor = () => {
    if (isGhost) return secondaryColor;
    if (isOutline) {
      return isDestructive ? errorColor : primaryColor;
    }
    // Filled buttons have light text on dark bg and vice-versa
    return textColorLight;
  };

  const buttonStyles = [
    styles.button,
    styles[size],
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: isOutline ? 1 : 0,
    },
    style,
    (disabled || loading) && styles.disabled,
  ];

  const iconSize = size === 'lg' ? 24 : size === 'md' ? 20 : 16;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
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
