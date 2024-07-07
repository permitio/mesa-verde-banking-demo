type Transaction = {
    id: number;
    date: string;
    description: string;
    amount: string;
  };
  
  type CurrentAccountData = {
    balance: string;
    transactions: Transaction[];
  };
  
  type SavingsAccountData = {
    balance: string;
    interestRate: string;
    transactions: Transaction[];
  };

  type AccountData = CurrentAccountData | SavingsAccountData;
  
  type MockData = {
    [key: string]: CurrentAccountData | SavingsAccountData;
  };
  
  const mockData: MockData = {
    "current-account-a": {
      balance: "£5,000.00",
      transactions: [
        { id: 1, date: "2024-06-01", description: "Grocery Store", amount: "-£50.00" },
        { id: 2, date: "2024-06-03", description: "Salary", amount: "+£3,000.00" },
        { id: 3, date: "2024-06-05", description: "Electricity Bill", amount: "-£100.00" },
        { id: 4, date: "2024-06-07", description: "Rent", amount: "-£1,500.00" },
        { id: 5, date: "2024-06-09", description: "Coffee Shop", amount: "-£5.00" },
        { id: 6, date: "2024-06-10", description: "Subscription", amount: "-£15.00" },
      ],
    },
    "current-account-b": {
      balance: "£3,000.00",
      transactions: [
        { id: 1, date: "2024-06-01", description: "Grocery Store", amount: "-£30.00" },
        { id: 2, date: "2024-06-03", description: "Salary", amount: "+£2,000.00" },
        { id: 3, date: "2024-06-05", description: "Electricity Bill", amount: "-£80.00" },
        { id: 4, date: "2024-06-07", description: "Rent", amount: "-£1,200.00" },
        { id: 5, date: "2024-06-09", description: "Coffee Shop", amount: "-£10.00" },
        { id: 6, date: "2024-06-10", description: "Subscription", amount: "-£20.00" },
      ],
    },
    "saving-account-a": {
      balance: "£10,000.00",
      interestRate: "3.6%",
      transactions: [
        { id: 1, date: "2024-06-01", description: "Interest", amount: "+£50.00" },
        { id: 2, date: "2024-06-03", description: "Deposit", amount: "+£5,000.00" },
        { id: 3, date: "2024-06-05", description: "Deposit", amount: "+£3,000.00" },
        { id: 4, date: "2024-06-07", description: "Interest", amount: "+£30.00" },
      ],
    },
  };
  
  export type { Transaction, CurrentAccountData, SavingsAccountData, AccountData, MockData };
  export default mockData;  