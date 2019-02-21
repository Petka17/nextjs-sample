import React from "react";
import { requestCode } from "shared/api/auth";

import {
  CodeRequestFail,
  CodeRequestSuccess,
  SetPhone,
  StartCodeRequest
} from "./action";
import { initialState, reducer } from "./state";

/**
 * Context for React Component
 */
interface Context {
  phone: string;
  setPhone: Function;
  canStartCodeRequest: boolean;
  startCodeRequest: Function;
  errorMessage: string;
}

const defaultAuth: Context = {
  phone: initialState.phone,
  setPhone: new Function(),
  canStartCodeRequest: false,
  startCodeRequest: new Function(),
  errorMessage: initialState.errorMessage
};

const ContextFactory = React.createContext<Context>(defaultAuth);

/**
 * Provider
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const [{ phone, isLoading, errorMessage }, dispatch] = React.useReducer(
    reducer,
    initialState
  );

  const setPhone = (phone: string) => dispatch(new SetPhone(phone));

  const canStartCodeRequest = phone.length === 11 && !isLoading;

  const startCodeRequest = () => {
    dispatch(new StartCodeRequest());

    requestCode(phone)
      .then((resp: string) => {
        console.log(`Response ${resp}`);
        dispatch(new CodeRequestSuccess(""));
      })
      .catch((err: string) => dispatch(new CodeRequestFail(err)));
  };

  const context: Context = {
    phone,
    setPhone,
    canStartCodeRequest,
    startCodeRequest,
    errorMessage
  };

  return (
    <ContextFactory.Provider value={context}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getState = () => React.useContext(ContextFactory);
