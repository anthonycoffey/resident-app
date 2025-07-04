import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { View, Text } from '@/components/Themed';

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
  return (
    <ScrollView style={styles.container}>
      {messages.map((message) => (
        <View
          key={message.id}
          style={[
            styles.messageContainer,
            message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            message.role === 'system_notification' && styles.systemMessage,
          ]}
        >
          <Text style={styles.messageText}>{message.content}</Text>
        </View>
      ))}
      {isLoading && (
        <View style={[styles.messageContainer, styles.assistantMessage]}>
          <ActivityIndicator size="small" color="#fff" />
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
    backgroundColor: '#007BFF',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#6c757d',
    alignSelf: 'flex-start',
  },
  systemMessage: {
    backgroundColor: '#f8d7da',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  messageText: {
    color: '#fff',
  },
});

export default MessageList;
