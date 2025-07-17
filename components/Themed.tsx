import {
  Text as DefaultText,
  View as DefaultView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// =================================================================
// Enhanced Text Component
// =================================================================

type TextVariant = 'default' | 'title' | 'subtitle' | 'caption' | 'link';

type TextProps = ThemeProps &
  DefaultText['props'] & {
    variant?: TextVariant;
    colorName?: keyof typeof Colors.light;
  };

export function Text(props: TextProps) {
  const {
    style,
    lightColor,
    darkColor,
    colorName = 'text',
    variant = 'default',
    ...otherProps
  } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorName);

  return (
    <DefaultText
      style={[{ color }, styles[variant], style]}
      {...otherProps}
    />
  );
}

// =================================================================
// Enhanced View Component
// =================================================================

export type ViewProps = ThemeProps &
  DefaultView['props'] & {
    backgroundColorName?: keyof typeof Colors.light;
  };

export function View(props: ViewProps) {
  const {
    style,
    lightColor,
    darkColor,
    backgroundColorName = 'background',
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    backgroundColorName
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

// =================================================================
// Typography Styles
// =================================================================

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontSize: 16,
    lineHeight: 30,
    color: Colors.light.primary, // Link color is often consistent
  },
});
