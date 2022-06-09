import AsyncStorage from '@react-native-async-storage/async-storage';
import createDataContext from './createDataContext';
import API from '../../clientAPI/api';
import { switchNavigation } from '../services/navigationServices';

const expenseReducer = (prevState, action) => {
	// console.log('EXPENSEReducer::ACTION === ', action);
	// console.log('EXPENSEReducer::STATE === ', prevState);
	switch (action.type) {
		case 'FETCH_EXPENSES':
			return { ...prevState, expenses: action.payload };
		case 'UPDATE_EXPENSE':
			return { ...prevState, lastUpdated: new Date() };
		case 'DELETED_EXPENSE':
			return { ...prevState, expenses: prevState.expenses.filter(x => x._id !== action.payload.id) };
		case 'HAS_LOADING_ERROR':
			return { ...prevState, loadingErrorMessage: action.payload, income: [] };
		case 'CLEAR_LOADING_ERROR':
			return { ...prevState, loadingErrorMessage: null };
		case 'HAS_ERROR':
			return { ...prevState, errorMessage: action.payload };
		case 'CLEAR_ERROR':
			return { ...prevState, errorMessage: '' };
		default:
			return prevState;
	}
};

const createExpense = dispatch => async (data) => {
	const currentUser = await AsyncStorage.getItem('currentUser');
	const { budgetId } = JSON.parse(currentUser);
	data.budgetId = budgetId;
	try {
		const response = await API.post(`/api/expense`, data);
		dispatch({
			type: 'UPDATE_EXPENSE',
			payload: response.data
		});
	} catch (err) {
		const errorMssg = err.response && err.response.data.errmsg && err.response.data.errmsg.includes('duplicate') ?
			'An expense with the same name already existst. Try changing the name.' :
			'Something went wrong while trying to add the expense.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('CREATION ERROR ==== \n', err)
	}
};

const updateExpense = dispatch => async (expense) => {
	try {
		const response = await API.post(`api/expense/${expense._id}`, expense);
		dispatch({
			type: 'UPDATE_EXPENSE',
			payload: response.data
		});
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to delete this expense.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('UPDATE ERROR - ', err)
	}
};

const fetchExpenses = dispatch => async (month) => {
	const response = await API.get(`/api/expenses/${month}`);
	dispatch({ type: 'FETCH_EXPENSES', payload: response.data });
};

const fetchExpenseById = dispatch => async (id) => {
	const response = await API.get(`api/expense/${id}`);
	dispatch({ type: 'FETCH_EXPENSE ', payload: response.data });
};

const deleteExpense = dispatch => async (id) => {
	try {
		await API.delete(`api/expense/${id}`);
		dispatch({ type: 'UPDATE_EXPENSE' });
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to delete this expense.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('DELETE ERROR - ', err)
	}
};

const deleteManyExpenses = dispatch => async (ids) => {
	try {
		await API.delete(`api/expense/deleteMany/${ids}`);
		dispatch({ type: 'UPDATE_EXPENSE' });
	} catch (err) {
		const errorMssg = 'Something went wrong while trying to delete this expense.';
		dispatch({
			type: 'HAS_ERROR',
			payload: errorMssg
		});
		console.log('DELETE ERROR - ', err)
	}
};

const clearLoadingError = dispatch => () => {
	dispatch({ type: 'CLEAR_LOADING_ERROR' });
}

const clearError = dispatch => () => {
	dispatch({ type: 'CLEAR_ERROR' });
};

export const { Provider, Context } = createDataContext(
	expenseReducer,
	{
		createExpense,
		fetchExpenses,
		fetchExpenseById, 
		updateExpense, 
		deleteExpense, 
		deleteManyExpenses, 
		clearLoadingError,
		clearError
	},
	{ expenses: null, errorMessage: null, lastUpdated: null, loadingErrorMessage: null }
)
