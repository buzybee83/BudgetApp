import { useLinking } from '@react-navigation/native';
import * as Linking from 'expo-linking';

export default function(containerRef) {
  return useLinking(containerRef, {
    prefixes: [Linking.makeUrl('/')],
    config: {
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Signup: 'signup',
        },
      },
      Intro: {
        path: 'intro',
        screens: {
          Intro: 'intro'
        }
      },
      Main: {
        path: 'main',
        screens: {
          Home: 'home',
          Bills: 'bills',
          Account: 'account',
        },
      },
    },
  });
}
