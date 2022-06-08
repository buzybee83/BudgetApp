import React, { useEffect, useContext, useState } from 'react';
import {
	SafeAreaView,
	Text,
	View,
	StyleSheet,
	Modal,
	Alert
} from 'react-native';
import {
	ActivityIndicator,
	Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { Constants, DarkTheme } from '../constants/Theme';
import { Context as IncomeContext } from '../context/IncomeContext';
import { Context as BudgetContext } from '../context/BudgetContext';
import { ButtonIcon } from '../components/Icons';
import IncomeListView from '../components/IncomeListView';
import IncomeForm from '../components/IncomeForm';
import TotalAmount from '../components/TotalAmount';
import { getCurrentMonth, getMonthLong } from '../services/utilHelper';

const IncomeScreen = ({ navigation }) => {
	const {
		state,
		fetchIncome,
		createIncome,
		updateIncome,
		updateIncomeItem,
		deleteIncomeItem
	} = useContext(IncomeContext);
	const budgetContext = useContext(BudgetContext);
	const [income, setIncome] = useState(null);
	const [formTitle, setTitle] = useState('');
	const [listState, setListState] = useState({ isLoading: true, isSaving: false });
	const [modalVisible, setModalVisible] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(null);
	
	const refreshIncomeData = React.useCallback(async () => {
		if (currentMonth) {
			await fetchIncome(currentMonth.month);
		}
	});

	const checkCurrentMonth = async () => {
		const month = await getCurrentMonth(budgetContext.state.budget.monthlyBudget);
		if (!currentMonth || month._id !== currentMonth._id) {
			state.income = [];
			setCurrentMonth(month);
		}
		const headerTitle = getMonthLong(month.month, 'Income');
		navigation.setOptions({ headerTitle });
	};

	useEffect(() => {
		setListState({ ...listState, isLoading: true })
		const unsubscribe = navigation.addListener('focus', async () => {
			checkCurrentMonth(currentMonth,'Income', navigation, setCurrentMonth);
		});
		return unsubscribe;
	}, [navigation]);

	useEffect(() => {
		console.log('##refresh INCOME START');
		setListState({ ...listState, isLoading: true });
		try {
			refreshIncomeData();
		} catch (err) {
			console.warn(`Error loading Income. ${err}`)
		} finally {
			setListState({ ...listState, isLoading: false });
			console.log('##refresh INCOME DONE');
		}
	}, [currentMonth, state.lastUpdated]);

	const actionRequired = (itemToDelete) => {
		Alert.alert(
			"Warning",
			"This is part of your recurring monthly income. How would you like to proceed?",
			[
				{
					text: "Delete all occurrances",
					onPress: () => deleteIncome(itemToDelete, 'all'),
					style: 'destructive'
				},
				// Maybe implement this later?
				// TODO: Figure out how to handle this using mongoose middleware (pre) | IncomeAPI
				// {
				// 	text: "Delete this & following occurrances",
				// 	onPress: () => deleteIncome(itemToDelete, 'from-current'),
				// 	style: 'warning'
				// },
				{
					text: "Delete this only",
					onPress: () => deleteIncome(itemToDelete, 'current'),
				}, {
					text: "Cancel",
					onPress: () => hideModal(),
					style: "cancel"
				}
			]
		);
	};

	const onSubmitIncome = async (data, incomeRef, saveOption) => {
		try {
			data.amount = parseFloat(data.amount).toFixed(2);
			data.incomeFrequency = {
				frequencyType: data.frequencyType,
				frequency: data.frequency
			}
			if (incomeRef && incomeRef._id) {
				incomeRef = {
					...incomeRef,
					...data
				};
				
				saveOption = saveOption?.value;
				if (saveOption) {
					incomeRef._id = incomeRef.incomeId ? incomeRef.incomeId : incomeRef._id;
					await updateIncome(incomeRef, saveOption);
				} else {
					await updateIncomeItem(incomeRef);
				}
			} else {
				data.isAutomated = data.frequencyType !== 'Misc/One time' ? true : false;
				await createIncome(data);
			}
			budgetContext.fetchMonthDetails(currentMonth);
		} catch (err) {
			Alert.alert(`Oops, something went wrong. Error: ${err}`);
			console.log(`ERROR OCCURED IN ${incomeRef ? 'SAVING':'CREATING'} INCOME => `, err)
		} finally {
			hideModal();
		}
	};

	const onDelete = (itemToDelete) => {
		if (!itemToDelete.isAutomated) {
			deleteIncome(itemToDelete)
		} else {
			actionRequired(itemToDelete);
		}
	};

	const deleteIncome = async (itemToDelete, deleteOccurrences) => {
		try {
			await deleteIncomeItem(itemToDelete, deleteOccurrences);
			budgetContext.fetchMonthDetails(currentMonth);
		} catch (err) {
			console.warn(err);
		} finally {
			if (modalVisible) {
				hideModal();
			}
		}
	};

	const editIncome = (incomeToEdit, title) => {
		setIncome(incomeToEdit);
		openModalForm(null, title);
	};

	const openModalForm = (ev, title) => {
		if (title) setTitle(title);
		else setTitle('Add Income');
		setModalVisible(true);
	};

	const hideModal = () => {
		setIncome(null);
		setModalVisible(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			{listState.isLoading ?
				<ActivityIndicator animating={true} style={{ flex: 1 }} color={Constants.primaryColor} /> :
				<>
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<TotalAmount 
							items={state.income} 
							fieldKey="amount" 
							calculateAmount={true}
							color={Constants.successColor} 
							heading={true}
							alignment="center"
						/>
					</View>
					<View style={{ flex: 8 }}>
						<IncomeListView
							income={state.income}
							errorMessage={state.errorMessage}
							currentMonth={currentMonth}
							onDelete={onDelete}
							onViewDetails={editIncome}
							showPreview={budgetContext.state.budget?.settings.showPreview}
						/>
					</View>
					
					<Modal
						visible={modalVisible}
						animationType="slide"
						presentationStyle="pageSheet"
						onRequestClose={hideModal}
					>
						<View style={styles.modalView}>
							<Text style={styles.modalTextHeader}>
								{formTitle}
							</Text>
							<MaterialIcons
								style={{ position: 'absolute', right: 8, top: -8 }}
								name="close"
								size={28}
								onPress={hideModal}
							/>
							<Divider style={{ height: 2 }} />
							{listState.isSaving ?
								<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} /> :
								<IncomeForm
									onSubmitForm={onSubmitIncome}
									item={income}
									currentMonth={currentMonth}
									onDelete={onDelete}
									settings={budgetContext.state.budget?.settings}
								/>
							}
						</View>
					</Modal>
					{ modalVisible || state.errorMessage ? null :
						<Button
							buttonStyle={styles.actionButton}
							raised
							onPress={openModalForm}
							icon={
								<ButtonIcon
									name="md-add"
									size={48}
									position="center"
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
		backgroundColor: Constants.secondaryColor
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

export default IncomeScreen;
