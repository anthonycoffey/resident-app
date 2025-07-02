import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { Link } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/config/firebaseConfig';
import styles from './styles';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const colorScheme = useColorScheme();

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={
          colorScheme === 'dark'
            ? require('@/assets/images/property-manager-pro-light.png')
            : require('@/assets/images/property-manager-pro.png')
        }
        style={localStyles.logo}
      />
      <Card>
        <Text style={styles.title}>Forgot Password</Text>
        <Input
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
        />
        <Button title='Reset Password' onPress={handlePasswordReset} />
      </Card>
      <View style={localStyles.linkContainer}>
        <Text>Remember your password? </Text>
        <Link href='/(auth)/login' asChild>
          <TouchableOpacity>
            <Text style={localStyles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const localStyles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  linkText: {
    color: '#007BFF',
  },
});
