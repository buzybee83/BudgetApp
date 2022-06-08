import React, { useState, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { InputIcon } from '../components/Icons';
import { Constants } from '../constants/Theme';
import Spacer from '../components/Spacer';
// import { State } from 'react-native-gesture-handler';

function AuthForm({ type, errorMessage, submitButtonText, onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setLoading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setLoading(false);
            };
        }, [])
    );

    useEffect(()=> {
        setLoading(false);
    },[errorMessage])

    const submitForm = async () => {
        setLoading(true);
        if (type == 'Signup') {
            await onSubmit({ firstName, lastName, email, password });
        } else {
            await onSubmit({ email, password });
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
                {type == 'Signup' &&
                    <>
                        <TextInput
                            label="First Name"
                            leftIcon={
                                <InputIcon
                                    class="leftIcon"
                                    name="md-person"
                                    size={24}
                                />
                            }
                            mode="outlined"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCorrect={false}
                        />
                        <Spacer size={2} />
                        <TextInput
                            label="Last Name"
                            leftIcon={
                                <InputIcon
                                    class="leftIcon"
                                    name="md-person"
                                    size={24}
                                />
                            }
                            mode="outlined"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCorrect={false}
                        />
                        <Spacer size={2} />
                    </>
                }
                <TextInput
                    label="Email"
                    leftIcon={
                        <InputIcon
                            class="leftIcon"
                            name="md-mail"
                            size={23}
                        />
                    }
                    mode="outlined"
                    placeholder="sample@domain.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCompleteType="email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                />
                <Spacer size={7} />
                <TextInput
                    label="Password"
                    leftIcon={
                        <InputIcon
                            class="leftIcon"
                            name="md-lock-closed"
                            size={23}
                        />
                    }
                    mode="outlined"
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearTextOnFocus={type !== 'Signup'}
                    secureTextEntry
                />
                <Spacer size={1} />
                <Text style={{ color: Constants.errorText }}>{errorMessage}</Text>
                {errorMessage !== undefined && <Spacer size={4} />}
                <Button
                    style={Constants.buttonDesign}
                    mode="contained"
                    color="white"
                    onPress={() => !isLoading && submitForm()}      
                >
                    { isLoading ? 
                        <ActivityIndicator animating={true} color="white" /> :
                        <Text style={Constants.buttonTextLarge}>{submitButtonText}</Text>
                    }
                </Button>
            </View>
        </TouchableWithoutFeedback>
    );
}

export default AuthForm;




