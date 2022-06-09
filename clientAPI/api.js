/*
* Start Axios on terminal: ngrok http [PORT_NUMBER] (eg ngrok http 3000)
* Copy Forwarding address corresponding to HTTP
* Update/paste baseURL below
*/
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const instance =  axios.create({
    baseURL: 'http://1384-66-73-195-100.ngrok.io'
});

instance.interceptors.request.use(
    async config => {
        let currentUser = await AsyncStorage.getItem('currentUser');
        if (currentUser) {
            currentUser = JSON.parse(currentUser);
            config.headers.Authorization = `Bearer ${currentUser.token}`;
            // console.log('TOKEN=', currentUser.token)
        }
        return config;
    },
    err => {
        console.log('AXIOS error : ', err)
        return Promise.reject(err);
    }
);

export default instance;