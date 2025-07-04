import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { View } from '@/components/Themed';
import { MaterialIcons } from '@expo/vector-icons';

type ChatInputProps = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

const ChatInput = React.forwardRef(({ onSendMessage, isLoading }: ChatInputProps, ref) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={ref as any}
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type your message..."
        editable={!isLoading}
      />
      <TouchableOpacity onPress={handleSend} disabled={isLoading} style={styles.sendButton}>
        <MaterialIcons name="send" size={24} color={isLoading ? '#ccc' : '#007BFF'} />
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
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default ChatInput;
