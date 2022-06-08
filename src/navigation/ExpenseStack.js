import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExpensesScreen from '../screens/ExpensesScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';

const Stack = createStackNavigator();

function ExpenseStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{
                    headerTitle: 'Monthly Expenses'
                }}
            />
            <Stack.Screen
                name="ExpenseDetails"
                component={ExpenseDetailScreen}
                options={{
                    headerBackTitle: '',
                    headerTitle: ''
                }}
            />
        </Stack.Navigator>
    );
}

export { ExpenseStack }
