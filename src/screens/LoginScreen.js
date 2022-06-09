import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet, Text, KeyboardAvoidingView, View, Platform } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { Card, Avatar } from 'react-native-paper';
// import { useHeaderHeight } from '@react-navigation/elements';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import NavLink from '../components/NavLink';
import Spacer from '../components/Spacer';
import WaveShape from '../components/WaveShape';

const LoginScreen = ({ navigation }) => {
    const [doneLoading, setDoneLoading] = useState(false)
    const { state, login, clearErrorMessage } = useContext(AuthContext);
    // const headerHeight = useHeaderHeight();

    useFocusEffect(
        React.useCallback(() => {
            if (state.errorMessage) clearErrorMessage();
        }, [])
    );
    
    useEffect(() => {
        if (state.errorMessage) clearErrorMessage();
        if (state.route && state.route !== 'Auth') {
            navigation.dispatch(
                StackActions.replace('MainFlow', {screen: state.route})
            );
        } else {
            setDoneLoading(true);
        }
    }, [state.route]);

    if (!doneLoading) return null

    return (
        <View  style={styles.container}>
            <WaveShape style={{ position: "absolute" , bottom: 0, zIndex: 1 }} opacity="0.55" path="pathTop" view="-1 1 350 750" fill="#9966ff" />
            <Text style={styles.header}> WELCOME </Text>
            <KeyboardAvoidingView 
                behavior={Platform.OS == 'ios'? "padding" : "height"}>
                <Card style={[Constants.boxShadow, { padding: 4 }]}>
                    <Card.Content>
                        <Avatar.Image 
                            style={{ marginBottom: 8, alignSelf: 'center', backgroundColor: '#fff' }} 
                            size={68} 
                            source={require('../assets/images/icon.png')} />
                        <AuthForm
                            errorMessage={state.errorMessage}
                            submitButtonText="Login"
                            onSubmit={login}
                        />
                    </Card.Content>
                    <Card.Actions style={{ flexDirection: 'column'}}>
                        <NavLink routeName="Signup" text="Don't have an account?" />
                    </Card.Actions>
                </Card> 
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        ...DarkTheme
    },
    header: {
        position: "absolute",
        top: 130,
        fontSize: 30,
        alignSelf: "center",
        color: '#fff',
        marginBottom: 20
    }
});

export default LoginScreen;
