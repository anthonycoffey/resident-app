import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '@/lib/config/firebaseConfig';
import { useAuth } from '@/lib/providers/AuthProvider';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { View, Text } from '@/components/Themed';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '76291599872-bhbovp08rl51dlsniukp4uq2eatj11lu.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Get the user's ID token
      const response = await GoogleSignin.signIn();
      console.log('Google Sign-In response:', response);

      // The idToken is now at response.data.idToken
      const idToken = response?.data?.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In failed: no ID token returned.');
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Force a refresh of the user's ID token to get custom claims
      if (userCredential.user) {
        await userCredential.user.getIdToken(true);
        await updateUser(userCredential.user);
      }
    } catch (error: any) {
      Alert.alert('Google Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = () => {
    // Placeholder for Microsoft login
    Alert.alert('Social Login', 'Microsoft login is not yet implemented.');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo-no-container.png')}
        style={styles.logo}
      />
      <Card>
        <Text style={styles.title}>Sign In</Text>
        <Input
          placeholder='Email Address'
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
        />
        <Input
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize='none'
          rightIcon={
            <FontAwesome
              name={showPassword ? 'eye-slash' : 'eye'}
              size={20}
              color='gray'
            />
          }
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        {loading ? (
          <ActivityIndicator size='large' color='#007BFF' />
        ) : (
          <Button title='Sign In with Email' onPress={handleLogin} />
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            width: '100%',
            alignSelf: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor:
                colorScheme === 'dark'
                  ? Colors.dark.divider
                  : Colors.light.divider,
            }}
          />
          <Text style={{ marginHorizontal: 8, color: '#888' }}>OR</Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor:
                colorScheme === 'dark'
                  ? Colors.dark.divider
                  : Colors.light.divider,
            }}
          />
        </View>

        <View style={styles.socialContainer}>
          <Button
            title='Sign In with Google'
            onPress={handleGoogleLogin}
            variant='outline'
            style={[styles.socialButton, { borderColor: '#db4437' }]}
            textStyle={styles.googleText}
          />
          {/* <Button
            title='Sign In with Microsoft'
            onPress={handleMicrosoftLogin}
            variant='outline'
            style={[styles.socialButton, { borderColor: '#0078D4' }]}
            textStyle={styles.microsoftText}
          /> */}
        </View>

        <View style={styles.linkContainer}>
          <Text>Don't have an account? </Text>
          <Link href='/(auth)/register' asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Card>
      <Link href='/(auth)/forgot-password' asChild>
        <TouchableOpacity style={styles.forgotPasswordLink}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 0,
  },
  socialContainer: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'transparent',
  },
  socialButton: {
    marginBottom: 8,
  },
  googleText: {
    color: '#db4437',
  },
  microsoftText: {
    color: '#0078D4',
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

export default LoginScreen;
