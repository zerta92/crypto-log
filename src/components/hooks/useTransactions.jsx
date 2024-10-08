import React, { useEffect } from "react";

export function useTransactions(account, cryptoTransactions) {
  const [transactionsCount, setTransactionsCount] = React.useState(0);
  const [transactions, setTransactions] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  useEffect(() => {
    if (cryptoTransactions !== null) {
      loadTransactions();
      setLoading(false);
    }
  }, [cryptoTransactions]);

  const transactionBigIntToNumberKeys = [
    "amount",
    "closeDate",
    "closeRate",
    "id",
    "rate",
    "transactionDate",
  ];
  async function loadTransactions() {
    const userTransactions = await cryptoTransactions.methods
      .getTransactionsByUser()
      .call({ from: account });

    setTransactionsCount(userTransactions.length);
    const allTransactions = [];

    for (let id of userTransactions) {
      const post = await cryptoTransactions.methods.transactions(id).call();
      Object.keys(post).forEach((key) => {
        if (transactionBigIntToNumberKeys.includes(key)) {
          post[key] = Number(post[key]);
        }
      });
      allTransactions.push(post);
    }

    setTransactions(
      allTransactions
        .filter((_transaction) => !_transaction.deleted)
        .sort((a, b) => Number(b.transactionDate) - Number(a.transactionDate))
    );
  }

  function createTransaction({ type, amount, transactionDate, rate }) {
    const rateToUse = rate;
    if (!rate) {
      throw new Error("Crypto rate missing");
    }
    setLoading(true);
    return new Promise((resolve, reject) => {
      cryptoTransactions.methods
        .createTransaction(type, amount, transactionDate, parseInt(rateToUse))
        .send({ from: account })
        .on("confirmation", function (confirmationNumber, receipt) {})
        .on("receipt", async (receipt) => {
          await loadTransactions();
          setLoading(false);
          resolve();
        })
        .on("error", function (error) {
          setLoading(false);
          setError(true);
          resolve();
        });
    });
  }

  function closeTrade({ id, closeDate, saleRateUsd }) {
    const closeRate = parseInt(saleRateUsd);
    setLoading(true);
    cryptoTransactions.methods
      .closeTrade(id, closeDate, closeRate)
      .send({ from: account })
      .on("confirmation", function (confirmationNumber, receipt) {})
      .on("receipt", async (receipt) => {
        await loadTransactions();

        setLoading(false);
      })
      .on("error", function (error) {
        console.log({ error });
        setLoading(false);
        setError(true);
      });
  }

  return {
    transactionsCount,
    transactions,
    transactionsLoading: loading,
    transactionsError: error,
    createTransaction,
    closeTrade,
  };
}
