
const PayFrequency = {
  1: 'Weekly',
  2: 'Bi-Weekly',
  3: 'Semi-Monthly',
  4: 'Monthly'
};

const EmploymentType = {
  1: 'Hourly',
  2: 'Salary',
  3: 'Commission'
};

const AmountTypes = {
  1: 'Amount',
  2: 'Percentage',
};

const Income = [{
  section: 'Let\'s Configure Your Income',
  order: 1,
  field: 'firstPayDate',
  label: 'Set Your Next Paycheck Date',
  type: 'date',
  format: 'MM/DD/YY'
}, {
  section: 'Set How Often You Get Paid',
  order: 2,
  parent: 'incomeType',
  field: 'payFrequency',
  label: 'Pay Frequency',
  type: 'select',
  default: 2,
  options: PayFrequency
}, {
  section: 'Set Your Income Type',
  order: 3,
  parent: 'incomeType',
  field: 'employmentType',
  label: 'Employment Status',
  type: 'select',
  default: 1,
  options: EmploymentType
}, {
  section: 'Add Your Net Income',
  order: 4,
  parent: 'incomeType',
  field: 'netAmount',
  label: 'Paycheck Amount',
  type: 'currency'
}, {
  section: 'Minimum Net Balance Threshold for Bill Allocation',
  order: 5,
  parent: 'balanceThresholds',
  field: 'isEnabled',
  label: 'Enable a Balance Threshold',
  type: 'switch',
  optionalSlides: [
    {
      section: 'Setup Threshold Amount',
      order: 6,
      parent: 'balanceThresholds',
      contollingElement: 'isEnabled',
      children: [
        {
          order: 1,
          field: 'thresholdType',
          label: 'Select Mode',
          type: 'select',
          default: 1,
          options: AmountTypes
        }, {
          order: 2,
          field: 'amount',
          label: 'Set Amount',
          type: 'number',
          maxValue: 100
        }
      ]
    }
  ]
}];

const Savings = [{
  section: 'Setup Budget Savings',
  order: 7,
  field: 'isEnabled',
  label: 'Enable Savings',
  type: 'switch',
  optionalSlides: [
    {
      section: 'Savings Allocation Amount',
      order: 8,
      parent: 'allocation',
      contollingElement: 'isEnabled',
      children: [
        {
          order: 1,
          field: 'amountType',
          label: 'Set Amount Type',
          type: 'select',
          default: 1,
          options: AmountTypes
        }, {
          order: 2,
          field: 'amount',
          label: 'Set Savings Amount to Allocate',
          type: 'number'
        }
      ]
    }, {
      section: 'Override Net Balance Thresholds',
      order: 9,
      field: 'overrideThresholds',
      label: 'Enable Override',
      tooltip: 'Must have Balance Threshold enabled',
      type: 'switch',
      contollingElement: 'isEnabled',
      default: false
    }
  ]
}];

export {
  PayFrequency,
  EmploymentType,
  AmountTypes,
  Income,
  Savings
}


