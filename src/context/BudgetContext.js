import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';
import API from '../../clientAPI/api';
import { switchNavigation } from '../services/navigationServices';

const budgetReducer = (prevState, action) => {
	// console.log('BUDGETReducer::ACTION === ', action);
	// console.log('BUDGETReducer::STATE === ', prevState);
	switch (action.type) {
		case 'FETCH_BUDGET':
			return { 
				...prevState, 
				budget: action.payload, 
				moveToActiveMonth: action.moveToActiveMonth,
				firstActiveIdx: action.firstActiveIdx, 
		  		errorMessage: ''
			};
		case 'UPDATED_BUDGET':
			return { ...prevState, budget: action.payload };
		case 'MONTH_DETAILS':
			return { ...prevState, currentMonth: action.payload };
		case 'HAS_ERROR':
			return { ...prevState, errorMessage: action.payload };
		case 'CLEAR_ERROR':
			return { ...prevState, errorMessage: '' };
		default:
			return prevState;
	}
};

const createBudget = dispatch => async (settings) => {
	let currentUser = await AsyncStorage.getItem('currentUser');
	currentUser = JSON.parse(currentUser);
	const budget = {
		settings
	};
	try {
		const response = await API.post('api/budget', budget);
		currentUser.budgetId = response.data._id
		await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));
		dispatch({ type: 'FETCH_BUDGET', payload: response.data, isCurrent: true });
	} catch (err) {
		console.log('CREATION ERROR ==== \n', err.response.data.error)
		let errorMssg;
		if (err.response) {
			if (err.response.data.error.includes('duplicate')) {
				switchNavigation('Home');
			} else {
				errorMssg = err.response.data.error
				dispatch({
					type: 'HAS_ERROR',
					payload: errorMssg
				});
			}
		} else {
			dispatch({
				type: 'HAS_ERROR',
				payload: 'An error occured. Please try again later.'
			});
		}
	}
};

const updateBudget = dispatch => async (budget) => {
	let currentUser = await AsyncStorage.getItem('currentUser');
	const { budgetId } = JSON.parse(currentUser);
	try {
		const response = await API.post(`api/budget/${budgetId}`, budget);
		dispatch({ type: 'UPDATED_BUDGET', payload: response.data, isCurrent: true });
	} catch (err) {
		dispatch({
			type: 'HAS_ERROR',
			payload: err
		});
	}
};

const fetchMonthDetails = dispatch => async (month) => {
	try {
		const response = await API.get(`api/month/${month._id}`);
		const result = {
			...response.data.monthDetails,
			expenses: response.data?.expenses,
			income: response.data?.income
		}
		console.log('CURRENT MONTH RESULT>>', result)
		dispatch({ type: 'MONTH_DETAILS', payload: result });
	} catch (err) {
		console.warn('ERROR FETCHING MONTH DETAILS :: ', err)
		dispatch({
			type: 'HAS_ERROR',
			payload: err
		});
	}
}

const fetchBudget = dispatch => async () => {
	const response = await API.get('api/budget');
	const firstActive = response.data.monthlyBudget.findIndex(month => month.active );
	dispatch({ type: 'FETCH_BUDGET', payload: response.data, moveToActiveMonth: (firstActive > 0), firstActiveIdx: firstActive });
};

const clearError = dispatch => () => {
	dispatch({ type: 'CLEAR_ERROR' });
};

export const { Provider, Context } = createDataContext(
	budgetReducer,
	{ createBudget, updateBudget, fetchMonthDetails, fetchBudget, clearError },
	{ budget: null, moveToActiveMonth: false, firstActiveIdx: 0, currentMonth: null, errorMessage: '', lastUpdated: '' }
)
