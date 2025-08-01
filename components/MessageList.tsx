import React from 'react';
import { ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { View, Text, useThemeColor } from '@/components/Themed';
import { Feather } from '@expo/vector-icons';
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system_notification';
  content: string;
  timestamp: Date;
  isReported?: boolean;
};

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onReportMessage: (messageId: string) => void;
};

const MessageList = ({ messages, isLoading, onReportMessage }: MessageListProps) => {
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
          {message.role === 'assistant' && (
            <TouchableOpacity
              onPress={() => onReportMessage(message.id)}
              disabled={message.isReported}
              style={styles.reportButton}
            >
              <Feather
                name="flag"
                size={16}
                color={message.isReported ? 'gray' : '#fff'}
              />
            </TouchableOpacity>
          )}
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
    position: 'relative',
  },
  reportButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    padding: 5,
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
