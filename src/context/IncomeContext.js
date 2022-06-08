import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';
import API from '../../clientAPI/api';
import { formatAutomatedIncome } from '../services/utilHelper';

const incomeReducer = (prevState, action) => {
	// console.log('INCOMEReducer::ACTION === ', action);
	// console.log('INCOMEReducer::STATE === ', prevState);
	switch (action.type) {
		case 'FETCH_INCOME':
			return { ...prevState, income: action.payload };
		case 'UPDATE_INCOME':
			return { ...prevState, lastUpdated: new Date() };
		case 'HAS_ERROR':
			if (prevState.income) {
				return { ...prevState, errorMessage: action.payload };
			}
			else return { ...prevState, errorMessage: action.payload, income: [] };
		case 'CLEAR_ERROR':
			return { ...prevState, errorMessage: '' };
		default:
			return prevState;
	}
};

const createIncome = dispatch => async (data) => {
	const currentUser = await AsyncStorage.getItem('currentUser');
	const { budgetId } = JSON.parse(currentUser);
	data.budgetId = budgetId;

	try {
		const response = await API.post(`/api/income`, data);
		console.log('CREATED NEW INCOME =', response.data)
		dispatch({ type: 'UPDATE_INCOME' });
	} catch (err) {
		const errorMssg = err.response && err.response.data.errmsg && err.response.data.errmsg.includes('duplicate') ?
			'An income with the same name already existst. Try changing the name.' :
			'Something went wrong while trying to add income.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('###INCOME CREATION ERROR ==== \n', err)
	}
};

const updateIncome = dispatch => async (income, propagate) => {
	try {
		const incomeId = income._id;
		if (propagate) {
			delete income._id;
            delete income.expectedDate;
		}
		await API.post(`api/income/${incomeId}?propagate=${propagate}`, income);
		dispatch({ type: 'UPDATE_INCOME' });
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to delete this income.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('###INCOME UPDATE ERROR ==== \n', err)
	}
};

const updateIncomeItem = dispatch => async (income) => {
	try {
		await API.post(`api/income/item/${income._id}`, income);
		dispatch({ type: 'UPDATE_INCOME' });
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to update this income.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('###INCOME ITEM UPDATE ERROR ==== \n', err)
	}
};

const fetchIncome = dispatch => async (month) => {
	try {
		const response = await API.get(`/api/income/${month}`);
		const data = formatAutomatedIncome(response.data);
		dispatch({ type: 'FETCH_INCOME', payload: data });
	} catch(err) {
		const errorMssg = 'Something went wrong while trying to retrieve your income for this month.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
 		console.log('###FETCH INCOME ERROR ==== \n', err)
	}
};

const fetchIncomeById = dispatch => async (id) => {
	const response = await API.get(`api/income/${id}`);
	dispatch({ type: 'FETCH_INCOME ', payload: response.data });
};

const deleteIncomeItem = dispatch => async (incomeItem, deleteOccurrences) => {
	let apiURL;
	switch(deleteOccurrences) {
		case 'all':
			apiURL = `api/income/${incomeItem.incomeId}`;
			break;
		default:
			apiURL = `api/income/item/${incomeItem._id}`;
			break;
	}

	try {
		await API.delete(apiURL);
		dispatch({ type: 'UPDATE_INCOME' });
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to delete this income.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('###INCOME DELETE ERROR ==== \n', err)
	}
};

const clearError = dispatch => () => {
	dispatch({ type: 'CLEAR_ERROR' });
};

export const { Provider, Context } = createDataContext(
	incomeReducer,
	{ createIncome, fetchIncome, fetchIncomeById, updateIncome, updateIncomeItem, deleteIncomeItem, clearError },
	{ income: null, lastUpdated: null, errorMessage: '' }
)
