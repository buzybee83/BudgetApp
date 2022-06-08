import * as React from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// const Auth = createNativeStackNavigator();
const INITIAL_ROUTE_NAME = 'Login';
const Stack = createNativeStackNavigator();

export default function AuthStack({ navigation, route }) {
	StatusBar.setBarStyle('light-content');

	return (
		<Stack.Navigator
			screenOptions={{ headerShown: false }}
			initialRouteName={INITIAL_ROUTE_NAME}>
			<Stack.Screen
				name="Login"
				options={{
					headerLeft: null
				}}
				component={LoginScreen}
			/>
			<Stack.Screen
				name="Signup"
				component={SignupScreen}
			/>
		</Stack.Navigator>
	);
}

Stack.navigationOptions = {
	header: null,
}

