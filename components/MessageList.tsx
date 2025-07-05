import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system_notification';
  content: string;
  timestamp: Date;
};

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
};

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const userMessageBg = useThemeColor({}, 'primary');
  const assistantMessageBg = useThemeColor({}, 'secondary');
  const systemMessageBg = useThemeColor({}, 'error');
  const textColor = useThemeColor({}, 'text');
  const primaryTextColor = '#fff'; // Assuming primary/secondary buttons have white text

  const getMessageStyle = (role: ChatMessage['role']) => {
    switch (role) {
      case 'user':
        return { ...styles.userMessage, backgroundColor: userMessageBg };
      case 'assistant':
        return { ...styles.assistantMessage, backgroundColor: assistantMessageBg };
      case 'system_notification':
        return { ...styles.systemMessage, backgroundColor: systemMessageBg };
    }
  };

  const getTextColor = (role: ChatMessage['role']) => {
    return role === 'user' || role === 'assistant' ? primaryTextColor : textColor;
  };

  return (
    <ScrollView style={styles.container}>
      {messages.map((message) => (
        <View
          key={message.id}
          style={[
            styles.messageContainer,
            getMessageStyle(message.role),
          ]}
        >
          <Text style={[styles.messageText, { color: getTextColor(message.role) }]}>{message.content}</Text>
        </View>
      ))}
      {isLoading && (
        <View style={[styles.messageContainer, styles.assistantMessage, { backgroundColor: assistantMessageBg }]}>
          <ActivityIndicator size="small" color={primaryTextColor} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  messageText: {},
});

export default MessageList;
