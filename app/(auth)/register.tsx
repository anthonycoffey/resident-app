import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/config/firebaseConfig';
import styles from './styles';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const colorScheme = useColorScheme();

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-no-container.png')}
        style={localStyles.logo}
      />
      <Card>
        <Text style={styles.title}>Sign Up</Text>
        <Input
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
        />
        <Input
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title='Register' onPress={handleRegister} />
        <View style={localStyles.linkContainer}>
          <Text>Already have an account? </Text>
          <Link href='/(auth)/login' asChild>
            <TouchableOpacity>
              <Text style={localStyles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Card>
      <Link href='/(auth)/forgot-password' asChild>
        <TouchableOpacity style={localStyles.forgotPasswordLink}>
          <Text style={localStyles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default RegisterScreen;

const localStyles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 0,
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
  forgotPasswordLink: {
    marginTop: 16,
    alignItems: 'center',
  },
});
