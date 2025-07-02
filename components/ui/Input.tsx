import React from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  TouchableOpacity,
} from 'react-native';
import { useThemeColor } from '../Themed';
import { FontAwesome } from '@expo/vector-icons';

interface CustomInputProps extends TextInputProps {
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Input = (props: CustomInputProps) => {
  const { rightIcon, onRightIconPress, ...rest } = props;
  const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
  const borderColor = useThemeColor(
    { light: '#ccc', dark: '#555' },
    'tabIconDefault'
  );
  const backgroundColor = useThemeColor(
    { light: '#fff', dark: '#333' },
    'background'
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color, borderColor, backgroundColor }]}
        placeholderTextColor={borderColor}
        {...rest}
      />
      {rightIcon && (
        <TouchableOpacity style={styles.rightIcon} onPress={onRightIconPress}>
          {rightIcon}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
  },
});

export default Input;
