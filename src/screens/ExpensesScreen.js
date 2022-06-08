import React, { useEffect, useContext, useState } from 'react';
import {
	SafeAreaView,
	Text,
	View,
	StyleSheet,
	Modal
} from 'react-native';
import {
	ActivityIndicator,
	Divider,
	Button
} from 'react-native-paper';
// import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
// import { Button } from 'react-native-elements';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as ExpenseContext } from '../context/ExpenseContext';
import { Context as BudgetContext } from '../context/BudgetContext';
import { ButtonIcon } from '../components/Icons';
import ExpenseListView from '../components/ExpenseListView';
import ExpenseForm from '../components/ExpenseForm';
import TotalAmount from '../components/TotalAmount';
import { getCurrentMonth, getMonthLong } from '../services/utilHelper';

const ExpensesScreen = ({ navigation }) => {
	const {
		state,
		fetchExpenses,
		createExpense,
		updateExpense,
		deleteExpense,
		deleteManyExpenses,
		clearError
	} = useContext(ExpenseContext);
	const budgetContext = useContext(BudgetContext);
	const [expense, setExpense] = useState(null);
	const [formTitle, setTitle] = useState('');
	const [listState, setListState] = useState({ isLoading: true, isSaving: false });
	const [modalVisible, setModalVisible] = useState(false);
	const [monthDetails, setMonthDetails] = useState(null);
	const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);


	const refreshExpenseData = React.useCallback(async () => {
		setListState({ ...listState, isLoading: true });

		if (monthDetails) {
			if (state.errorMessage) clearError();
			await fetchExpenses(monthDetails.month);
		}
	});

	const checkMonthDetails = async () => {
		const month = await getCurrentMonth(month);
		if (!monthDetails || month._id !== monthDetails._id) {
			state.expenses = [];
			setMonthDetails(month);
			const headerTitle = getMonthLong(month.month, 'Expenses');
			navigation.setOptions({ headerTitle });
		}
	};

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', async () => {
			await checkMonthDetails();
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		console.log('##refresh EXPENSE START');
		setListState({ ...listState, isLoading: true });
		try {
			refreshExpenseData();
			
		} catch(err) {
			console.warn(`Error loading Expenses. ${err}`)
		} finally {
			setListState({ ...listState, isLoading: false });
			console.log('##refresh EXPENSE END');
		}
	}, [monthDetails, state.lastUpdated]);

	const togglePaid = async (id) => {
		setListState({ ...listState, isSaving: true });
		const updatedItem = state.expenses.filter(item => item._id === id)[0];
		try {
			updatedItem.isPaid = !updatedItem.isPaid;
			await updateExpense(updatedItem);
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn('ERROR OCCURED IN SAVING EXPENSE - ', err)
		} finally {
			setListState({ ...listState, isSaving: false });
		}
	};

	const onSubmitExpense = async (data, expenseRef) => {
		setListState({ ...listState, isSaving: true });

		try {
			data.frequency = {
				isRecurring: data.isRecurring,
				recurringType: data.recurringType
			};
			data.amount = amount = parseFloat(data.amount).toFixed(2);
			data.dueDay = new Date(new Date(monthDetails.month).setDate(data.dueDay));
			if (expenseRef && expenseRef._id) {
				expenseRef = {
					...expenseRef,
					...data
				};
				await updateExpense(expenseRef);

			} else {
				data.budgetId = budgetContext.state.budget._id,
				await createExpense(data);
			}
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn('ERROR OCCURED IN SAVING EXPENSE - ', err)
		} finally {
			hideModal();
			setListState({ ...listState, isSaving: false });
		}
	};

	const onDeleteExpense = async (id) => {
		try {
			await deleteExpense(id);
			budgetContext.fetchMonthDetails(monthDetails);
		} catch (err) {
			console.warn(err);
		} finally {
			if (modalVisible) {
				hideModal();
			}
		}
	};

	const onMultiDeleteExpenses = async (expenseIds) => {
		await deleteManyExpenses(expenseIds);
		budgetContext.fetchMonthDetails(monthDetails);
	}

	const toggleMultiSelectAction = (enabled) => {
		setMultiSelectEnabled(enabled);
	}

	const editExpense = (id, title) => {
		const expense = state.expenses.filter(item => item._id == id)[0];
		setExpense(expense);
		openModalForm(null, title);
	};

	const openModalForm = (ev, title) => {
		if (title) setTitle(title);
		else setTitle('Add Expense');
		setModalVisible(true);
	};

	const hideModal = () => {
		setExpense(null);
		setModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			{listState.isLoading ? 
				<ActivityIndicator animating={true} style={{ paddingVertical: 45 }} color={Constants.primaryColor}/> :
				<>
					<View style={{flex: 1, justifyContent: 'center'}}>
                        <TotalAmount 
							items={state.expenses} 
							calculateAmount={true}
							fieldKey="amount" 
							heading={true}
							color={Constants.warnColor}
							alignment="center"
						/>
                    </View>
					<View style={{flex: 8}}>
						<ExpenseListView 
							expenses={state.expenses} 
							errorMessage={state.errorMessage}
							currentMonth={monthDetails}
							onMultiSelectEnabled={toggleMultiSelectAction}
							onUpdate={togglePaid}
							onDelete={onDeleteExpense} 
							onDeleteMany={onMultiDeleteExpenses}
							onViewDetails={editExpense}
						/>
					</View>
					<Modal
						visible={modalVisible}
						animationType="slide"
						presentationStyle="formSheet"
						onRequestClose={hideModal}
					>
						<View style={styles.modalView}>
							<Text style={styles.modalTextHeader}>
								{formTitle}
							</Text>
							<MaterialIcons 
								style={{position: 'absolute', right: 8, top: -8}} 
								name="close" 
								size={28} 
								onPress={hideModal}
							/>
							<Divider style={{ height: 2 }} />
							{listState.isSaving ?
								<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} /> :
								<ExpenseForm onSubmitForm={onSubmitExpense} expense={expense} onDelete={deleteExpense} />
							}
						</View>
					</Modal>
					{ modalVisible || multiSelectEnabled ? null :  
						<Button
							buttonStyle={styles.actionButton}
							raised
							onPress={openModalForm}
							icon={
								<ButtonIcon
									name="md-add"
									size={48}
									position="center"
									color="white"
								/>
							}
						/>
					}
				</>
			}
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignContent: 'stretch',
		justifyContent: 'space-between',
		...DarkTheme
	},
	actionButton: {
		display: 'flex',
		position: 'absolute',
		bottom: 8,
		alignSelf: 'center',
		justifyContent: 'center',
		paddingLeft: 10,
		width: 64,
		height: 64,
		borderRadius: 100,
		backgroundColor: Constants.warnColor
	},
	modalView: {
		flex: 1,
		backgroundColor: 'white',
		marginTop: 20,
		paddingHorizontal: 24
	},
	modalTextHeader: {
		fontSize: Constants.fontLarge,
		fontWeight: Constants.fontWeightMedium,
		marginBottom: 12,
		textAlign: "center"
	}
});

export default ExpensesScreen;
