import React, { useReducer, useContext, createContext, useEffect } from "react";

const GlobalStateContext = createContext(null);
const GlobalDispatchContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case "setCurrency":
      return {
        ...state,
        currency: action.payload,
        rate: getCurrencyUSDRate(action.payload),
        symbol: getCurrencySymbol(action.payload),
      };
    default:
      throw new Error(`Unknown action?`);
  }
};

const getCurrencyUSDRate = (currency) => {
  if (currency === "GBP") {
    return 0.79;
  }
  return 1;
};

const getCurrencySymbol = (currency) => {
  if (currency === "GBP") {
    return "£";
  }
  return "$";
};

export const GlobalProvider = ({ children }) => {
  const locale = "GBP";

  const initialState = {};

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "setCurrency", payload: locale });
  }, [locale]);

  return (
    <GlobalDispatchContext.Provider value={dispatch}>
      <GlobalStateContext.Provider value={state}>
        {children}
      </GlobalStateContext.Provider>
    </GlobalDispatchContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalStateContext);
export const useDispatchGlobal = () => useContext(GlobalDispatchContext);
