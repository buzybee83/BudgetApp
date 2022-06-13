import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as AuthProvider } from '../context/AuthContext';
import { Provider as BudgetProvider } from '../context/BudgetContext';

//IMPORT ROUTES
import AuthLoading from '../screens/AuthLoading';
import IntroScreen from '../screens/IntroScreen';
import AuthStack from './AuthStack';
// import IntroStack from './IntroStack';
import HomeStack from './HomeStack';

//APP STACK
const AppStack = createNativeStackNavigator();

const MainStack = createNativeStackNavigator();

export default function AppRouter() {
    const MainNavigator = () => {
        return (
            <BudgetProvider>
                <MainStack.Navigator 
                    screenOptions={{
                        "headerShown": false
                    }}
                    options={{
                        headerLeft: null
                    }}
                >
                    <AppStack.Screen
                        name="Auth"
                        component={AuthStack}
                    />
                    <AppStack.Screen
                        name="Intro"
                        component={IntroScreen}
                    />
                    <AppStack.Screen
                        options={{
                            headerLeft: null
                        }}
                        name="MainFlow"
                        component={HomeStack}
                    />
                </MainStack.Navigator>
            </BudgetProvider>
        );
    };

    return (
        <AuthProvider>
            <AppStack.Navigator
                initialRouteName="Loading"
                screenOptions={{
                    "headerShown": false
                }}
                options={{
                    headerLeft: null
                }}>
                <AppStack.Screen
                    name="Loading"
                    component={AuthLoading}
                />
                <AppStack.Screen
                    name="Main"
                    component={MainNavigator}
                />
            </AppStack.Navigator>
        </AuthProvider>
    );
}

