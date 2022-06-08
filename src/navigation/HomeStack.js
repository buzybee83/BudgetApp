import React from 'react';
import { StatusBar } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBarIcon } from '../components/Icons';
import { Provider as IncomeProvider } from '../context/IncomeContext';
import { Provider as ExpenseProvider } from '../context/ExpenseContext';

import HomeScreen from '../screens/HomeScreen';
import IncomeScreen from '../screens/IncomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AccountScreen from '../screens/AccountScreen';
import { Constants } from '../constants/Theme';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Overview';
// const Stack = createStackNavigator();

// const HomeTabs = () => {
export default function HomeStack({ navigation }) {

	StatusBar.setBarStyle('dark-content');
	return (
		<IncomeProvider>
 			<ExpenseProvider>
				<BottomTab.Navigator
					initialRouteName={INITIAL_ROUTE_NAME}
					screenOptions={{
						"tabBarActiveTintColor": Constants.tintColor,
						"tabBarStyle": [{
							"display": "flex"
						},null]
					}}
				>
					<BottomTab.Screen
						name="Overview"
						component={HomeScreen}
						options={{
							tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home" />,
						}}
					/>
					<BottomTab.Screen
						name="Income"
						component={IncomeScreen}
						options={{
							tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="attach-money" />,
						}}
					/>
					<BottomTab.Screen
						name="Expenses"
						component={ExpensesScreen}
						options={{
							tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="credit-card" />,
						}}
					/>
					<BottomTab.Screen
						name="Account"
						component={AccountScreen}
						options={{
							tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="settings" />,
						}}
					/>
				</BottomTab.Navigator>
			</ExpenseProvider>
		</IncomeProvider>
	);
}

// export default function HomeStack({ navigation }) {
// 	return (
// 		<IncomeProvider>
// 			<ExpenseProvider>
// 				<Stack.Navigator>
// 					<Stack.Screen
// 						name="Home"
// 						component={HomeTabs}
// 						screenOptions={
// 							({ route }) => ({
// 								title: getHeaderTitle(route),
// 								headerShown: setHeaderShown(route)
// 							})
// 						}
						
// 					/>
// 				</Stack.Navigator>
// 			</ExpenseProvider>
// 		</IncomeProvider>
// 	);
// }

const getCurrentMonth = () => {
	const { month } = JSON.parse(AsyncStorage.getItem('currentMonth')) || '';
	return getMonthLong(month, 'Income');
}

const getHeaderTitle = (route) => {
	// If the focused route is not found, we need to assume it's the initial screen
	// This can happen during if there hasn't been any navigation inside the screen
	// In our case, it's "Home" as that's the first screen inside the navigator
	const routeName = getFocusedRouteNameFromRoute(route) ?? 'Overview';
	switch (routeName) {
		case 'Overview':
			return '';
		case 'Income':
			return 'Income';
		case 'Expenses':
			return 'Monthly Expenses';
		case 'Account':
			return 'My Account';
	}
}

const setHeaderShown = (route) => {
	const routeName = getFocusedRouteNameFromRoute(route) ?? 'Overview';
	console.log('routeName==',routeName)
	if (routeName == 'Overview') return false;

	return true;
}


