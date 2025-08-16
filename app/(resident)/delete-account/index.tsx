import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Text as ThemedText, useThemeColor } from '@/components/Themed';

export default function DeleteAccountScreen() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const functions = getFunctions();
  const auth = getAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');

  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password to delete your account.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      const anonymizeAndDeleteUser = httpsCallable(functions, 'anonymizeAndDeleteUser');
      await anonymizeAndDeleteUser();

      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', error.message || 'An error occurred while deleting your account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Card>
        <ThemedText variant="title">Delete Account</ThemedText>
        <ThemedText style={styles.description}>
          This action is irreversible. Please be certain you want to delete your account before
          proceeding.
        </ThemedText>
        <ThemedText style={styles.description}>
          To confirm, please enter your password below.
        </ThemedText>
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button
          title="Delete My Account"
          onPress={handleDeleteAccount}
          loading={isLoading}
          variant="filled"
          destructive
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  description: {
    marginVertical: 8,
  },
  input: {
    marginBottom: 16,
  },
});
