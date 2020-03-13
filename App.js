import React from 'react';
import { AsyncStorage } from 'react-native';
import { Platform, StatusBar } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Provider as AuthProvider } from './context/AuthContext';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import useLinking from './navigation/useLinking';
import { setTopNavigator } from './services/navigationServices';

const Stack = createStackNavigator();

export default function App({ navigation, ...props }) {
	const [isLoadingComplete, setLoadingComplete] = React.useState(false);
	const [initialNavigationState, setInitialNavigationState] = React.useState();
	const containerRef = React.useRef();
	const { getInitialState } = useLinking(containerRef);
	const [isAuthenticated, setAuthState] = React.useState(false);

	// Load any resources or data that we need prior to rendering the app
	React.useEffect(() => {
		async function loadResourcesAndDataAsync() {
			try {
				SplashScreen.preventAutoHide();

				// Load our initial navigation state
				setInitialNavigationState(await getInitialState());
				// Load fonts
				await Font.loadAsync({
					...Ionicons.font,
					'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
				});
				const currentUser = await AsyncStorage.getItem('currentUser');
				console.log('**APP** LOADING CURRENT USER === ', currentUser)
				if (currentUser) {
					setAuthState(true);
				}
			} catch (e) {
				// We might want to provide this error information to an error reporting service
				console.warn(e);
			} finally {
				setLoadingComplete(true);
				SplashScreen.hide();
			}
		}

		loadResourcesAndDataAsync();

	}, []);

	if (!isLoadingComplete && !props.skipLoadingScreen) {
		return null;
	} else {
		return (
			<AuthProvider>
				{Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
				<NavigationContainer
					ref={containerRef => setTopNavigator(containerRef)}
					initialState={initialNavigationState}
				>
					<Stack.Navigator initialRouteName={isAuthenticated ? 'Root' : 'Auth'}>
						<Stack.Screen
							name="Auth"
							component={AuthNavigator}
							options={{
								headerLeft: null,
								headerShown: false,
								animationTypeForReplace: isAuthenticated ? 'pop' : 'push',
							}}
						/>
						<Stack.Screen
							name="Root"
							component={BottomTabNavigator}
							options={{
								headerLeft: null,
								animationTypeForReplace: isAuthenticated ? 'pop' : 'push',
							}}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</AuthProvider>
		);
	}
}

