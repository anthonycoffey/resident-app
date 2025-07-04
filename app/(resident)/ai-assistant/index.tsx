import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { View, Text } from '@/components/Themed';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import Button from '@/components/ui/Button';
import { getFunctions, httpsCallable } from 'firebase/functions';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system_notification';
  content: string;
  timestamp: Date;
};

const AiAssistantScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatInputRef = useRef<{ focus: () => void }>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: "Hi! I'm your virtual assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (inputText: string) => {
    if (isLoading || !inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);
    setError(null);

    const payload = {
      messages: nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content })),
      useFineTuned: true,
    };

    try {
      const functions = getFunctions();
      const getGptChatResponse = httpsCallable(functions, 'getGptChatResponse');
      const result = await getGptChatResponse(payload);
      const responseData = result.data as { message: string };

      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: responseData.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error('Error calling getGptChatResponse:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Button
        title="Connect to Live Agent"
        onPress={() => Alert.alert('Coming Soon!', 'This feature is not yet available.')}
        variant="outline"
        style={styles.liveAgentButton}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        ref={chatInputRef}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  liveAgentButton: {
    margin: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
  },
});

export default AiAssistantScreen;
