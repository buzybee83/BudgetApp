import React, { useState } from 'react';
import {
    View,
    StyleSheet, 
    TouchableWithoutFeedback, 
    Keyboard, 
    TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'
import { useForm, Controller } from "react-hook-form";
import { TextInput, Button, Caption, Text } from 'react-native-paper';
import { Constants } from '../constants/Theme';
import Spacer from '../components/Spacer';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { IncomeType } from '../services/utilHelper';

const IncomeForm = ({ onSubmitForm, onDelete, item, currentMonth, settings }) => {
    const { control, handleSubmit, formState, errors, watch } = useForm({
        mode: 'onChange',
    });
    const watchFrequencyType = watch('frequencyType', (item ? (item.incomeFrequency ? item.incomeFrequency.frequencyType : 'Misc/One time') : 'Paycheck'));
    const monthStart = new Date(new Date(currentMonth.month).setDate(1));
    const monthEnd = new Date(new Date(monthStart.getFullYear(), monthStart.getMonth()+1, 0));
    const { isDirty, isSubmitted, isValidating } = formState;
    
    const onSubmit = (incomeData) => {
        if (isDirty && !Object.keys(errors).length) {
            if (item && item.incomeId) {
                if (!propagationOptions[propagationSelection]) {
                    return;
                }
            } 
            if (!item && !incomeData.frequencyType == 'Misc/One time') incomeData.isAutomated = false;
            
            onSubmitForm(incomeData, item, propagationOptions[propagationSelection]);
        }
    };

    const [propagationSelection, setPropagationSelection] = useState(null);
    const propagationOptions = [
        { label: "Yes", value: true },
        { label: "No", value: false },
    ];

    const onSelect = (idx) => {
        setPropagationSelection(idx);
    }

    const formatDate = (date) => {
        date = new Date(date);
        return new Intl.DateTimeFormat('en-US', { dateStyle: 'full'}).format(date);
    }

    const getPaydayTitle = (date) => {
        date = new Date(date);
        if (date > new Date()) {
            return 'Expected';
        }
        return 'Recieved';
    }

    const ButtonGroup = () => {
        return (
            <View style={{ flexDirection: 'row', alignContent: 'stretch' }}>
                {propagationOptions.map((option, index) => {
                    const selectedLabelStyle = propagationSelection == index && styles.selectedLabelStyle;
                    const selectedBtnStyle = propagationSelection == index && styles.selectedBtnGroup
                    return (
                        <View style={[styles.btnGroup, selectedBtnStyle]} key={index}>
                            <TouchableWithoutFeedback onPress={() => onSelect(index)}>
                                <Text style={[styles.formLabel, selectedLabelStyle, { textAlign: 'center' }]}>{option.label}</Text>
                            </TouchableWithoutFeedback>
                        </View>
                    )
                })}
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.formContainer}>
                <View>
                    <Spacer size={1} />
                    { item &&
                        <>
                            <View style={{ paddingBottom: 4 }}>
                                <Button>{IncomeType[item.incomeType]}</Button>
                            </View>
                            { (!propagationSelection) &&
                                <View>
                                    <Text style={[styles.formLabel, styles.labelCenter]}>Date {getPaydayTitle(item.expectedDate)} </Text>
                                    <Button>{formatDate(item.expectedDate)}</Button>
                                </View>
                            }
                            { item.incomeId &&
                                <View style={{ flexDirection: 'column', paddingBottom: 24, paddingTop: 20  }}>
                                    <Text style={styles.formLabel}> Apply changes to future occurrances? </Text>
                                    <ButtonGroup/>
                                    {isDirty && isSubmitted && !propagationOptions[propagationSelection] &&
                                        <Text style={styles.hasError}>This is required.</Text>
                                    }
                                </View>
                            }
                        </>
                    }
                    <Controller
                        control={control}
                        render={({ onChange, value, ref }) => (
                            <TextInput
                                label="Description"
                                mode="outlined"
                                inputRef={ref}
                                onChangeText={value => onChange(value)}
                                value={value}
                            />
                        )}
                        name="description"
                        rules={{ required: true }}
                        defaultValue={item ? item.description : ""}
                    />
                    {errors.description && <Text style={styles.hasError}>This is required.</Text>}
                    {!errors.description && <Spacer size={1} />}
                    <Controller
                        control={control}
                        render={({ onChange, value, ref }) => (
                            <TextInput
                                label="Amount"
                                mode="outlined"
                                keyboardType="numeric"
                                inputRef={ref}
                                onChangeText={value => onChange(value)}
                                value={value}
                            />
                        )}
                        rules={{ required: true, pattern: /^[0-9]+(\.\d{1,2})?$/ }}
                        name="amount"
                        defaultValue={item ? item.amount.toFixed(2).toString() : ""}
                    />
                    { errors.amount && errors.amount.type == 'required' &&
                        <Text style={styles.hasError}>This is required.</Text>
                    }
                    { errors.amount && errors.amount.type == 'pattern' && !isValidating &&
                        <Text style={styles.hasError}>Must be a valid number and up to 2 decimal places.</Text>
                    }
                    
                    { !item &&
                        <>
                            <View style={styles.fieldContainer}>
                                <View style={{ flex: 2, justifyContent: 'flex-end' }}>
                                    <Text style={[styles.formLabel, { marginTop: 12 }]}>Type of Income </Text>
                                </View>
                                <Controller
                                    control={control}
                                    render={({ onChange, value }) => (
                                        <Picker
                                            value={value}
                                            type="outlined"
                                            style={styles.pickerContainer}
                                            itemStyle={styles.pickerItem}
                                            selectedValue={value}
                                            onValueChange={value => onChange(value)}
                                        >
                                            <Picker.Item label="Paycheck" value="Paycheck" />
                                            <Picker.Item label="Recurring" value="Recurring" />
                                            <Picker.Item label="Misc/One time" value="Misc/One time" />
                                        </Picker>
                                    )}
                                    name="frequencyType"
                                    defaultValue={"Paycheck"}
                                />
                            </View>
                            {watchFrequencyType == 'Paycheck' &&
                                <Caption style={{marginTop: 30}}>
                                    When selecting "Paycheck", your future payday income will be generated 
                                    based on your pay schedule in your income settings.
                                </Caption>
                            }
                        </>
                    }

                    { watchFrequencyType == 'Recurring' &&
                        <>
                            <View style={styles.fieldContainer}>
                                <View style={{ flex: 2, justifyContent: 'flex-end' }}>
                                    <Text style={[styles.formLabel, { paddingTop: 12 }]}>Frequency</Text>
                                </View>
                                <Controller
                                    control={control}
                                    render={({ onChange, value }) => (
                                        <Picker
                                            value={value}
                                            type="spinner"
                                            style={styles.pickerContainer}
                                            itemStyle={styles.pickerItem}
                                            selectedValue={value}
                                            onValueChange={value => onChange(value)}
                                        >
                                            <Picker.Item label="Weekly" value="Weekly" />
                                            <Picker.Item label="Bi-Weekly" value="Bi-Weekly" />
                                            <Picker.Item label="Semi-Monthly" value="Semi-Monthly" />
                                            <Picker.Item label="Monthly" value="Monthly" />
                                        </Picker>
                                    )}
                                    name="frequency"
                                    defaultValue={item ? item.incomeFrequency.frequency : "Monthly"}
                                />
                            </View>
                        </>
                    }

                    {(!item || propagationSelection == 1) &&
                        <View style={{ paddingTop: 6 }}>
                            <Text style={[styles.formLabel, styles.labelCenter, { marginTop: 32 }]}>Date Expected</Text>
                            <Controller
                                control={control}
                                render={({ onChange, value }) => (
                                    <RNDateTimePicker
                                        textColor="#444"
                                        style={styles.datePicker}
                                        onChange={(event, date) => onChange(date)}
                                        value={new Date(value)}
                                        minimumDate={monthStart}
                                        maximumDate={monthEnd}
                                        mode="date"
                                        display="spinner"
                                    />
                                )}
                                rules={{ required: true }}
                                name="expectedDate"
                                defaultValue={item ? item.expectedDate : monthStart}
                            />
                        </View> 
                    }
                    {errors.expectedDate && <Text style={styles.hasError}>This is required.</Text>}
                </View>
                <View style={{ paddingTop: 20 }}>
                    <Text style={styles.warningText}>
                        {isSubmitted && !isDirty && !Object.keys(errors).length ? 'No change detected.' :
                            (isSubmitted && Object.keys(errors).length && !isValidating ? 'Please fix fields with errors.' : '')
                        }
                    </Text>

                    <Button
                        mode="contained"
                        dark
                        style={styles.primaryBtn}
                        onPress={handleSubmit(onSubmit)}
                    >
                        {item ? 'Update' : 'Save'}
                    </Button>
                    {onDelete && item &&
                        <Button
                            style={{ marginTop: 6 }}
                            color={Constants.errorText}
                            mode="outlined"
                            onPress={() => onDelete(item)}
                            TouchableComponent={TouchableOpacity}
                        >
                            Delete
                        </Button>
                    }
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}
const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 50
    },
    pickerContainer: {
        flex: 3,
        height: 60, 
        marginBottom: 5
    },
    pickerItem: {
        maxHeight: 110
    },
    datePicker: {
        height: 95
    },
    formLabel: {
        fontSize: Constants.fontMedium,
        color: Constants.darkGrey
    },
    fieldContainer: {
        display: 'flex',
        marginVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    hasError: {
        fontSize: Constants.fontSmall,
        color: Constants.errorText,
        marginVertical: 8
    },
    warningText: {
        fontSize: Constants.fontSmall,
        color: Constants.errorText,
        paddingVertical: 6
    },
    btnGroup: {
        borderColor: Constants.tintColor,
        borderWidth: 1,
        backgroundColor: 'white',
        flex: 2,
        padding: 8,
        marginTop: 16,
        marginBottom: 6
    },
    selectedBtnGroup: {
        backgroundColor: Constants.tintColor
    },
    labelCenter: {
		alignSelf: 'center'
	},
    selectedLabelStyle: {
        color: 'white',
        fontWeight: Constants.fontWeightMedium
    },
    primaryBtn: {
        backgroundColor: Constants.tintColor
    },
    deleteBtn: {
        color: Constants.errorText
    }
});

export default IncomeForm;

// <Picker
//     value={value}
//     type="outlined"
//     itemStyle={styles.pickerItem}
//     style={styles.pickerContainer}
//     selectedValue={value.toString()}
//     onValueChange={value => onChange(value ? parseInt(value) : "")}
//     value={value}
// >
//     <Picker.Item label="Select day..." value="" />
//     {Object.keys(daysInMonth).map((key) => {
//         return (
//             <Picker.Item
//                 key={key + 1}
//                 label={daysInMonth[key] + (nth(daysInMonth[key]))}
//                 value={daysInMonth[key]}
//             />
//         )
//     })}
// </Picker>

// {item && item.incomeType == 1 && dirtyFields.expectedDate &&
//     <View style={{ flexDirection: 'column' }}>
//         <Caption> Changes to the date will only apply to this instance. </Caption>
//     </View>
// }