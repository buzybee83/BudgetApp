import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';
import API from '../../clientAPI/api';

const authReducer = (state, action) => {
	// console.log('AuthReducer::ACTION === ', action);
	// console.log('AuthReducer::STATE === ', state);
	switch (action.type) {
		case 'RESTORE_TOKEN':
			return { ...state, userToken: action.payload, route: action.route, isAuthenticated: true };
		case 'LOGIN':
			return { errorMessage: '', userToken: action.payload, route: action.route, isAuthenticated: true };
		case 'LOGOUT':
			return { errorMessage: '', userToken: null, isAuthenticated: false, route: 'Auth' };
		case 'HAS_ERROR':
			return { ...state, errorMessage: action.payload, isAuthenticated: false };
		case 'CLEAR_ERROR':
			return { ...state, errorMessage: '' };
		default:
			return state;
	}
};

const clearErrorMessage = dispatch => () => {
	dispatch({ type: 'CLEAR_ERROR' });
};

const signup = dispatch => async ({ firstName, lastName, email, password }) => {
	try {
		const response = await API.post('api/signup', { firstName, lastName, email, password });
		await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
		dispatch({ type: 'LOGIN', payload: response.data.token, route: 'Intro' });
	} catch (err) {
		const errorMssg = err.response && err.response.data.errmsg && err.response.data.errmsg.includes('duplicate') ?
			'An account with this email already exists. Try loging in or reset your password' :
			`Something went wrong while trying to create your account. ${err}`;
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
	}
};

const login = dispatch => async ({ email, password }) => {
	try {
		const response = await API.post('api/login', { email, password });
		await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
		if (response.data.budgetId) {
			dispatch({ type: 'LOGIN', payload: response.data.token, route: 'Main' });
		} else {
			dispatch({ type: 'LOGIN', payload: response.data.token, route: 'Intro' });
		}
	} catch (err) {
		const errorMssg = err.response && err.response.data.error ?
			err.response.data.error :
			`Something went wrong while tryign to log you in, please try later. ${err}`;
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
	}
};

const logout = dispatch => async () => {
	await AsyncStorage.removeItem('currentUser');
	dispatch({ type: 'LOGOUT'});
};

const bootstrapAuthAsync = dispatch => async () => {
	try {
		let currentUser = await AsyncStorage.getItem('currentUser');
		currentUser = JSON.parse(currentUser);
		if (currentUser.budgetId) {
			dispatch({ type: 'RESTORE_TOKEN', payload: currentUser.token, route: 'Main' });
		} else {
			dispatch({ type: 'RESTORE_TOKEN', payload: currentUser.token, route: 'Intro'});
		}
	} catch (err) {
		// No token found!
		dispatch({ type: 'LOGOUT'});
	}
}

export const { Provider, Context } = createDataContext(
	authReducer,
	{ signup, login, logout, clearErrorMessage, bootstrapAuthAsync },
	{ isAuthenticated: false, route: '', errorMessage: '' }
);
