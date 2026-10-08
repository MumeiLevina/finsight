export type TxType='INCOME'|'EXPENSE';
export type Category={id:string;name:string;type:TxType;color:string;userId?:string|null};
export type Transaction={id:string;type:TxType;amount:string;date:string;note?:string|null;category:Category};
export type Summary={month:string;totalIncome:string;totalExpense:string;netBalance:string;budgetLimit:string;remainingBudget:string;budgetUsage:number;recentTransactions:Transaction[];expenseByCategory:{category:Category;amount:string}[]};
export type User={id:string;name:string;email:string};
