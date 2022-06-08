import React from 'react';
import { StyleSheet, View, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { TextInputMask } from 'react-native-masked-text';
import { Picker } from '@react-native-picker/picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';


import { Constants } from '../constants/Theme';

const getRawValue = (formattedVal) => {
	return parseFloat(formattedVal.replace(/[$,]/g, ''));
}

const FieldTemplate = ({ item, action, childIndex }) => {
	switch (item.type) {
		case 'switch':
			return (
				<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
					<Text style={[styles.label, styles.labelCenter]}> {item.label} </Text>
					<Switch
						value={item.value}
						trackColor={{ false: '#646464', true: '#4A148C' }}
						onValueChange={(value) => {
							item.value = value;
							action(value);
						}}
					/>
				</View>
			);
		case 'currency':
			return (
				<View
					style={{ alignItems: 'center' }}
				>
					<Text style={[styles.label, { marginBottom: 16 }]}> {item.label} </Text>
					<TextInputMask
						style={styles.maskedInputStyle}
						type={'money'}
						value={item.value}
						options={{
							separator: '.',
							delimiter: ',',
							unit: '$',
							suffixUnit: ''
						}}
						onChangeText={(value) => {
							item.value = value;
							action(getRawValue(value));
						}}
					/>
				</View>
			);
		case 'date':
			const today =  new Date();
			return (
				<>
					<Text style={[styles.label, styles.labelCenter]}> {item.label} </Text>
					<RNDateTimePicker
						testID="datePicker"
						textColor="white"
						timeZoneOffsetInMinutes={today.getTimezoneOffset()}
						value={item.value ? item.value : today}
						minimumDate={today}
						mode="date"
						display="spinner"
						onChange={(event, selectedDate) => {
							item.value = selectedDate;
							console.log('Selected Date = ', selectedDate);
							action(selectedDate);
						}}
					/>
				</>
			);
		case 'select':
			return (
				<>
					<Text style={[styles.label, styles.labelCenter]}> {item.label} </Text>
					<Picker
						style={styles.picker}
						itemStyle={styles.pickerItem}
						testID={item.field}
						selectedValue={item.value}
						onValueChange={(itemValue) => {
							item.value = itemValue;
							if (childIndex !== undefined) action(itemValue, childIndex);
							else action(itemValue);
						}}
					>
						{
							Array.isArray(item.options) ? 
							item.options.map(option => {
								return <Picker.Item key={option} label={option} value={option} />;
							}) :
							Object.keys(item.options).map((key) => {
								return <Picker.Item key={key} label={item.options[key]} value={key} />;
							})
						}
					</Picker>
				</>
			);
		case 'number':
			return (
				<View
					style={{ alignItems: 'center' }}
				>
					<Text style={[styles.label, { marginBottom: 16 }]}> {item.label} </Text>
					<TextInputMask
						style={styles.maskedInputStyle}
						value={item.value}
						type={'only-numbers'}
						options={{
							unit: '',
							separator: '.',
							delimiter: ',',
							suffixUnit: ''
						}}
						onChangeText={(value) => {
							item.value = value;
							if (childIndex !== undefined) action(getRawValue(value), childIndex);
							else action(getRawValue(value));
						}}
					/>
				</View>
			);
		default:
			return <></>
	}
};

export default class InitialFlowForm extends React.Component {
	render() {
		return (
			<>
				{this.props.data.children ?
					this.props.data.children.map((child, index) => {
						return (
							<FieldTemplate
								key={index}
								item={child}
								childIndex={index}
								action={this.props.action}
							/>
						)
					}) :
					<FieldTemplate
						item={this.props.data}
						action={this.props.action}
					/>
				}
			</>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	label: {
		color: '#fff',
		fontSize: Constants.fontMedium,
		marginTop: 4
	},
	labelCenter: {
		alignSelf: 'center'
	},
	picker: {
		color: '#fff'
	},
	pickerItem: {
		color: '#fff',
		height: 115
	},
	maskedInputStyle: {
		width: '55%',
		fontSize: 20,
		height: 40,
		padding: 6,
		textAlign: 'center',
		backgroundColor: '#fff',
		borderRadius: 2
	},
});


