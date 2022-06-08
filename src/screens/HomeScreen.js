import React from 'react';
import { View, SafeAreaView, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
// import update from 'react-addons-update';
import Swiper from 'react-native-swiper'

import { Constants, DarkTheme } from '../constants/Theme';
import { Context as BudgetContext } from '../context/BudgetContext';
import { getMonthLong } from '../services/utilHelper';
import PieChart from '../components/PieChart';
import TotalAmount from '../components/TotalAmount';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

export default class HomeScreen extends React.Component {
	state = {
		isRefreshing: false,
		moveToActiveMonth: this.context.moveToActiveMonth,
		settings: null,
		monthList: [],
		currentMonth: null
	};
	static contextType = BudgetContext;

	componentDidMount = async () => {
		console.log('HOMESCREEN::componentDidMount RAN');
		try {
			await this.context.fetchBudget();
			await this.context.fetchMonthDetails(this.context.state.budget.monthlyBudget[this.context.state.firstActiveIdx]);

			this.setState({ 
				settings: this.context.state.budget.settings, 
				moveToActiveMonth: this.context.state.firstActiveIdx > 0 ? true : false,
				monthList: this.context.state.budget.monthlyBudget
			});
		} catch (err) {
			console.error(err);
		}
	}

	componentDidUpdate(navProps, prevProps) {
		console.log('HOMESCREEN::componentDidUpdate RAN');
		if ((this.state.currentMonth && !prevProps.currentMonth) || 
			(prevProps.currentMonth && this.state.currentMonth._id !== prevProps.currentMonth._id)) {
			this.props.navigation.setOptions({ headerTitle: getMonthLong(this.state.currentMonth.month, new Date(this.state.currentMonth.month).getFullYear()) });
			this.getMonthDetails();
			this.setState({monthDetails: this.context.state.currentMonth});
			AsyncStorage.setItem('currentMonth', JSON.stringify(this.context.state.currentMonth));
		} else {
			if (this.state.currentMonth && 
				(this.context.state.currentMonth.balance !== this.state.currentMonth.balance || 
					this.context.state.currentMonth.expensesPaidToDate !== this.state.currentMonth.expensesPaidToDate)) {
				this.setState({monthDetails: this.context.state.currentMonth});
			}
		}
	}

	async getMonthDetails() {
		await this.context.fetchMonthDetails(this.state.currentMonth);
	}

	scrollToActiveMonth() {
		if (this.Swiper) {
			if (this.context.state.firstActiveIdx > 0) this.Swiper.scrollTo(this.context.state.firstActiveIdx)
		}
	}

	setIndex = (index) => {
		if (this.state.moveToActiveMonth) {
			if (index == this.context.state.firstActiveIdx) {
				this.setState({ 
					moveToActiveMonth: false,
					currentMonth: this.state.monthList[index],
					monthDetails: this.context.state.currentMonth
				});
			}
		} else {
			this.setState({
				currentMonth: this.state.monthList[index],
				// monthDetails: null
			});
		}
	};

	ListItem(item, idx) {
		const colors = ['#fff', '#f2f2f2'];
		const iconColor = item.isPaid ? Constants.successColor : Constants.iconDefault;
		const itemStyle = item.isPaid ? styles.itemStyle : {};
		return (
			<View key={idx} style={[styles.listContent, {backgroundColor: colors[idx % colors.length]}]}>
				<Text>{item.name}</Text>
				<View style={itemStyle}>	
					{ item.isPaid &&
						<Chip textStyle={{ fontSize: Constants.fontXxSmall, position: 'absolute', top: -8, margin: 'auto' }}
							style={{ 
								marginRight: 8, 
								backgroundColor: iconColor,
								height: 18,
								width: 40,
								top: 0,
								paddingVertical: 0,
								paddingHorizontal: 2
							}}
						>
							Paid
						</Chip>
					}
					<Text>
						{item.amount.toLocaleString("en-US",{
							style: "currency", 
							currency: "USD"})
						}
					</Text>
				</View>
			</View>
		);
	}

	render() {
		if (!this.state.monthList.length) {
			return <ActivityIndicator animating={true} style={{ flex: 1 }} />;
		} else {
			return (
				<Swiper
					ref={ref => this.Swiper = ref}
					index={0}
					onIndexChanged={this.setIndex.bind(this)}
					activeDotColor={Constants.primaryColor}
					buttonWrapperStyle={{ color: Constants.primaryColor }}
					showsButtons={true}
					autoplay={this.state.moveToActiveMonth}
					autoplayTimeout={0}
					animated={true}
					removeClippedSubviews={false}
					nextButton={<Text style={[{marginRight: -8},styles.buttonText]}>›</Text>}
					prevButton={<Text style={[{marginLeft: -8}, styles.buttonText]}>‹</Text>}
					loop={false}>
					{this.state.monthList.map((_item, key) => (
						<SafeAreaView key={key} style={styles.container}>
							<PieChart
								pieData={this.state.monthDetails}
								defaultSelection="Income"
							/>
							<View style={styles.headingContainer}>
								<View>
									<Text style={styles.headingText}>Balance</Text>
									<TotalAmount 
										value={this.state.monthDetails?.balance}
										textStyle={styles.subheadingText}
										alignment="left"
									/>
								</View>
								<View>
									<Text style={styles.headingText}>Expenses</Text>
									<TotalAmount 
										value={this.state.monthDetails?.totalExpenses} 
										textStyle={styles.subheadingText}
										alignment="right"
									/>
								</View>	
							</View>
							{this.state.isRefreshing ?
								<View style={styles.cardContainer}>
									<ActivityIndicator animating={true} style={{ paddingVertical: 30 }} />
								</View> : 
								<ScrollView style={styles.listContainer}>
									{ this.state.monthDetails?.expenses && 
										this.state.monthDetails.expenses.map((expns, idx) => {
										return this.ListItem(expns, idx)
									})}
								</ScrollView>
							}
						</SafeAreaView>
					))}
				</Swiper>
			)
		}
	}
}

const styles = StyleSheet.create({
	container: {
		...DarkTheme,
		flex: 1,
		alignContent: 'stretch',
		justifyContent: 'space-between'
	},
	flatlistContainer: {
		width: (SCREEN_WIDTH + 1),
		height: '100%'
	},
	buttonText: {
		fontSize: 42,
		color: Constants.primaryColor
	},
	contentContainer: {
		flexGrow: 1,
		alignSelf: 'center'
	},
	headingContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		marginBottom: 8
	},
	headingText: {
		fontWeight: Constants.fontWeightHeavy,
		color: Constants.whiteColor,
		fontSize: Constants.fontLarge
	},
	subheadingText: {
		fontWeight: Constants.fontWeightMedium,
		color: Constants.whiteColor,
		fontSize: Constants.fontMedium
	},
	cardContainer: {
		// padding: 24,
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		margin: 1,
	},
	listContainer: {
		backgroundColor: Constants.whiteColor,
		width: '100%',
		height: '100%',
		paddingBottom: 24
	},
	listContent: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 24,
		paddingVertical: 8,
		fontSize: Constants.fontMedium
	},
	itemStyle: {
		width: '40%',
		flexDirection: 'row', 
		justifyContent: 'space-between',
		alignSelf: 'flex-end'
	},
	cardContent: {
		padding: 24,
		// borderTopWidth: 1,
		// borderColor: '#444'
	}
});

{/* export default HomeScreen 
<ScrollView
		refreshControl={
			<RefreshControl
				tintColor={Constants.primaryColor}
				refreshing={isRefreshing}
				onRefresh={refreshBudgetData}
			/>
		}
	></ScrollView> 
	<FlatList
	style={styles.flatlistContainer}
	data={state?.budget?.monthlyBudget}
	keyExtractor={item => item._id}
	horizontal
	legacyImplementation={false}
	showsVerticalScrollIndicator={false}
	refreshControl={
		<RefreshControl
			tintColor={Constants.noticeText}
			refreshing={isRefreshing}
			onRefresh={refreshBudgetData}
		/> */}
	

	// <ScrollView>
	// 			<FlatList
	// 				style={styles.flatlistContainer}
	// 				data={state?.budget?.monthlyBudget}
	// 				keyExtractor={item => item._id}
	// 				horizontal
	// 				legacyImplementation={false}
	// 				showsVerticalScrollIndicator={false}
	// 				pagingEnabled={true}
	// 				contentContainerStyle={styles.contentContainer}
	// 				renderItem={({ item }) => {
	// 					return (
	// 						<Card
	// 							title={getMonthLong(item.month)}
	// 							containerStyle={styles.cardContent}
	// 						>
	// 							{ isRefreshing ? 
	// 								<ActivityIndicator animating={true} style={{paddingVertical: 30}}/> :
	// 								<Text>Month Overview</Text>
	// 							}
	// 						</Card>
	// 					)
	// 				}}
	// 			/>
	// 		</ScrollView>