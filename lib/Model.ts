export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
};

export type TransferRequest = {
  to: string;
  transaction: Transaction;
  OTP: string;
};
