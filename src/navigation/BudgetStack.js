import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MonthDetailScreen from '../screens/MonthDetailScreen';

const Stack = createStackNavigator();

function BudgetStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Budget"
                component={HomeScreen}
                options={{
                    headerTitle: 'Month Overview'
                }}
            />
            <Stack.Screen
                name="MonthDetails"
                component={MonthDetailScreen}
                options={{
                    headerBackTitle: '',
                    headerTitle: ''
                }}
            />
        </Stack.Navigator>
    );
}

export { BudgetStack }
