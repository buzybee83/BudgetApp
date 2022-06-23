import React from 'react';
import { StatusBar } from 'react-native';
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
const INITIAL_ROUTE_NAME = 'Home';
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
						name="Home"
						component={HomeScreen}
						options={({
							tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="home" />
						})}
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

