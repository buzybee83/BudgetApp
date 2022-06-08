import * as React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroScreen from '../screens/IntroScreen';

const Stack = createNativeStackNavigator();

export default function IntroStack({ navigation, route }) {
  return (
    <Stack.Navigator 
        headerMode="none"
        initialRouteName="Intro">
      <Stack.Screen
        name="Intro"
        options={{
            headerLeft: null
        }}
        component={IntroScreen}
      />
    </Stack.Navigator>
  );
}

Stack.navigationOptions = {
  header: null,
}

