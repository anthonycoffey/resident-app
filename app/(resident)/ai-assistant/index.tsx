import React, { useState, useEffect, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, useThemeColor } from '@/components/Themed';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system_notification';
  content: string;
  timestamp: Date;
  isReported?: boolean;
};

const AiAssistantScreen = () => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const errorColor = useThemeColor({}, 'error');
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
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error('Error calling getGptChatResponse:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportMessage = async (messageId: string) => {
    const messageToReport = messages.find((m) => m.id === messageId);
    if (!messageToReport) return;

    Alert.alert(
      'Report Message',
      'Are you sure you want to report this message as offensive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: async () => {
            try {
              const auth = getAuth();
              const user = auth.currentUser;

              if (!user) {
                throw new Error('You must be logged in to report a message.');
              }

              const idTokenResult = await user.getIdTokenResult();
              const firestore = getFirestore();
              await addDoc(collection(firestore, 'reportedMessages'), {
                messageId: messageToReport.id,
                messageContent: messageToReport.content,
                reporterId: user.uid,
                reportedAt: serverTimestamp(),
                reporterClaims: {
                  organizationId: idTokenResult.claims.organizationId,
                  roles: idTokenResult.claims.roles,
                },
              });

              setMessages((prevMessages) =>
                prevMessages.map((m) =>
                  m.id === messageId ? { ...m, isReported: true } : m
                )
              );

              Alert.alert('Report Submitted', 'Thank you for your feedback.');
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : 'An unknown error occurred.';
              setError(errorMessage);
              console.error('Error reporting message:', err);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        title='Connect to Live Agent'
        onPress={() => Linking.openURL('tel:+18665848488')}
        variant='outline'
        style={{ margin: 10 }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <Card style={{ flex: 1, backgroundColor: 'transparent' }}>
          {error && (
            <Text
              style={{ color: errorColor, textAlign: 'center', padding: 10 }}
            >
              {error}
            </Text>
          )}
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onReportMessage={handleReportMessage}
            />
          </View>
          <ChatInput
            ref={chatInputRef}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Card>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AiAssistantScreen;
