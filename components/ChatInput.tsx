import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { View, useThemeColor } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

type ChatInputProps = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

const ChatInput = React.forwardRef(({ onSendMessage, isLoading }: ChatInputProps, ref) => {
  const [text, setText] = useState('');
  const primaryColor = useThemeColor({}, 'primary');
  const dividerColor = useThemeColor({}, 'divider');
  const inputBackgroundColor = useThemeColor({}, 'input');
  const textColor = useThemeColor({}, 'text');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <View style={[styles.container, { borderTopColor: dividerColor, backgroundColor: 'transparent' }]}>
      <TextInput
        ref={ref as any}
        style={[
          styles.input,
          {
            borderColor: dividerColor,
            backgroundColor: inputBackgroundColor,
            color: textColor,
          },
        ]}
        value={text}
        onChangeText={setText}
        placeholder="Type your message..."
        placeholderTextColor={useThemeColor({}, 'label')}
        editable={!isLoading}
      />
      <TouchableOpacity onPress={handleSend} disabled={isLoading} style={styles.sendButton}>
        <MaterialIcons name="send" size={24} color={isLoading ? dividerColor : primaryColor} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default ChatInput;
