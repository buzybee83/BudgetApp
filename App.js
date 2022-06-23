import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { setTopNavigator } from './src/services/navigationServices';

import AppRouter from './src/navigation/AppRouter';

const CustomTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#6200ee'
	},
	userDefinedThemeProperty: '',
	animation: {
		...DefaultTheme.animation,
		customProperty: 1,
	},
};

const App = function() {
	const barTheme = useState('light-content');
	const [appIsReady, setAppIsReady] = useState(false);
	
	// Load any resources or data that we need prior to rendering the app
	const loadResourcesAndDataAsync = useCallback(async () => {
		try {
			await SplashScreen.preventAutoHideAsync();
			// Load fonts
			await Font.loadAsync({
				...Ionicons.font,
				...MaterialIcons.fonts,
				'roboto-light': require('./src/assets/fonts/Roboto-Light.ttf'),
				'roboto-light-i': require('./src/assets/fonts/Roboto-LightItalic.ttf'),
				'roboto': require('./src/assets/fonts/Roboto-Regular.ttf'),
				'roboto-medium': require('./src/assets/fonts/Roboto-Medium.ttf'),
				'roboto-medium-i': require('./src/assets/fonts/Roboto-MediumItalic.ttf'),
				'roboto-bold': require('./src/assets/fonts/Roboto-Bold.ttf'),
				'roboto-bold-i': require('./src/assets/fonts/Roboto-BoldItalic.ttf'),
				'space-mono': require('./src/assets/fonts/SpaceMono-Regular.ttf'),
			});
		} catch (e) {
			// We might want to provide this error information to an error reporting service
			console.warn(e);
		} finally {
			setAppIsReady(true);
		}
	});

	const onLayoutRootView = useCallback(async () => {
		if (appIsReady) {
			// This tells the splash screen to hide immediately! If we call this after
			// `setAppIsReady`, then we may see a blank screen while the app is
			// loading its initial state and rendering its first pixels. So instead,
			// we hide the splash screen once we know the root view has already
			// performed layout.
			await SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	React.useEffect(() => {
		loadResourcesAndDataAsync();
	}, []);
	
	React.useEffect(() => {
		onLayoutRootView();
	}, [appIsReady]);

	if (!appIsReady) {
		return null;
	}
	return (
		<>
			{Platform.OS === 'ios' && <StatusBar barStyle={barTheme} />}
			<PaperProvider theme={CustomTheme} >
				<NavigationContainer ref={containerRef => setTopNavigator(containerRef)}>
					<AppRouter />
				</NavigationContainer>
			</PaperProvider>
		</>
	);
}

export default App;
