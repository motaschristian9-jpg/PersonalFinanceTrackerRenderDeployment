import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  fetchBudgets,
  fetchGoals,
  fetchReports,
  fetchProfile,
  addTransaction,
  addBudget,
  addGoal,
  addContribution,
  updateTransaction,
  updateBudget,
  updateGoal,
  deleteTransaction,
  deleteBudget,
  deleteGoal,
  deleteContribution,
  addExpenseToBudget,
  changePassword,
  updateProfile,
  updateUserCurrency,
} from "./api";

const useFetch = (key, fetchFn, defaultValue = []) => {
  const queryResult = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const res = await fetchFn();
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  return {
    ...queryResult,
    data: queryResult.data ?? defaultValue,
  };
};

export const useProfile = () => useFetch("user", fetchProfile);

export const useTransactions = () =>
  useFetch("transactions", fetchTransactions);

export const useBudgets = () => useFetch("budgets", fetchBudgets);

export const useGoals = () => useFetch("goals", fetchGoals);

export const useReports = () => useFetch("reports", fetchReports);

const createMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const { onSettledHook = null } = options;

  return useMutation({
    mutationFn,
    onMutate: options.onMutate,
    onError: options.onError,
    onSettled: () => {
      if (onSettledHook) {
        onSettledHook(queryClient);
      }
    },
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTransaction,
    onMutate: async (newTxData) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) => [
        ...old,
        { id: Date.now(), ...newTxData },
      ]);

      return { previousTransactions };
    },
    onError: (err, newTxData, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 300);
    },
  });
};

export const useAddBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBudget,
    onMutate: async (newBudgetData) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });
      const previousBudgetData = queryClient.getQueryData(["budgets"]);

      queryClient.setQueryData(["budgets"], (old = []) => [
        ...old,
        {
          ...newBudgetData,
          budget_id: Date.now(),
          amount: Number(newBudgetData.amount) || 0,
          description: newBudgetData.description || "",
        },
      ]);

      return { previousBudgetData };
    },
    onError: (err, newBudgetData, context) => {
      if (context?.previousBudgetData) {
        queryClient.setQueryData(["budgets"], context.previousBudgetData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useAddGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGoal,
    onMutate: async (newGoalData) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoalData = queryClient.getQueryData(["goals"]);

      queryClient.setQueryData(["goals"], (old = []) => [...old, newGoalData]);

      return { previousGoalData };
    },
    onError: (err, newGoalData, context) => {
      if (context?.previousGoalData) {
        queryClient.setQueryData(["goals"], context.previousGoalData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useAddContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addContribution,
    onError: (err) => {
      console.error("Failed to add contribution:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useAddExpenseToBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpenseToBudget,
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const prevBudgets = queryClient.getQueryData(["budgets"]);
      const prevTransactions = queryClient.getQueryData(["transactions"]);

      if (prevBudgets) {
        queryClient.setQueryData(["budgets"], (old) =>
          old.map((budget) =>
            budget.id === newExpense.budgetId
              ? {
                  ...budget,
                  expenses: [...(budget.expenses ?? []), newExpense],
                  spent: (budget.spent ?? 0) + newExpense.amount,
                }
              : budget
          )
        );
      }

      if (prevTransactions) {
        queryClient.setQueryData(["transactions"], (old) => [
          ...old,
          {
            ...newExpense,
            id: Date.now(),
            type: "expense",
          },
        ]);
      }

      return { prevBudgets, prevTransactions };
    },
    onError: (err, newExpense, context) => {
      if (context?.prevBudgets) {
        queryClient.setQueryData(["budgets"], context.prevBudgets);
      }
      if (context?.prevTransactions) {
        queryClient.setQueryData(["transactions"], context.prevTransactions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) =>
        old.map((tx) => (tx.id === id ? { ...tx, ...data } : tx))
      );

      return { previousTransactions };
    },
    onError: (err, variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 500);
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudget,
    onMutate: async (updatedBudget) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });
      const previousBudgets = queryClient.getQueryData(["budgets"]);

      queryClient.setQueryData(["budgets"], (old = []) =>
        old.map((budget) =>
          budget.budget_id === updatedBudget.id
            ? {
                ...budget,
                ...updatedBudget,
                allocated: Number(updatedBudget.amount) ?? budget.allocated,
                description: updatedBudget.description ?? budget.description,
              }
            : budget
        )
      );

      return { previousBudgets };
    },
    onError: (err, newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(["budgets"], context.previousBudgets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateGoal(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData(["goals"]);

      queryClient.setQueryData(["goals"], (oldGoals) =>
        oldGoals
          ? oldGoals.map((goal) =>
              goal.id === id ? { ...goal, ...data } : goal
            )
          : []
      );

      return { previousGoals };
    },
    onError: (err, variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousTransactions = queryClient.getQueryData(["transactions"]);

      queryClient.setQueryData(["transactions"], (old = []) =>
        old.filter((tx) => tx.id !== id)
      );

      return { previousTransactions };
    },
    onError: (error, id, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          ["transactions"],
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }, 500);
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudget,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["budgets"] });
      const previousBudgets = queryClient.getQueryData(["budgets"]);

      queryClient.setQueryData(["budgets"], (old = []) =>
        old.filter((budget) => budget.budget_id !== id)
      );

      return { previousBudgets };
    },
    onError: (err, id, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(["budgets"], context.previousBudgets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
};

export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContribution,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData(["goals"]);

      queryClient.setQueryData(["goals"], (oldGoals = []) =>
        oldGoals.map((goal) => ({
          ...goal,
          contributions:
            goal.contributions?.filter(
              (contribution) => contribution.id !== id
            ) ?? [],
        }))
      );

      return { previousGoals };
    },
    onError: (err, id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGoal,
    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData(["goals"]);

      queryClient.setQueryData(["goals"], (old = []) =>
        old.filter((goal) => goal.id !== goalId)
      );

      return { previousGoals };
    },
    onError: (err, goalId, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onMutate: async (passwordData) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      const previousUser = queryClient.getQueryData(["user"]);

      if (previousUser) {
        queryClient.setQueryData(["user"], {
          ...previousUser,
          updatingPassword: true,
        });
      }

      return { previousUser };
    },
    onError: (err, passwordData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileData }) => updateProfile(userId, profileData),
    onMutate: async ({ userId, profileData }) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      const previousUser = queryClient.getQueryData(["user"]);

      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        ...profileData,
      }));

      return { previousUser };
    },
    onError: (err, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserCurrency,
    onMutate: async (newCurrency) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      const previousUser = queryClient.getQueryData(["user"]);

      queryClient.setQueryData(["user"], (old) => ({
        ...old,
        currency_symbol: newCurrency.currency_symbol,
      }));

      return { previousUser };
    },
    onError: (err, newCurrency, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
