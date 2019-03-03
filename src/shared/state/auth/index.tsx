import React from "react";
import { requestCode, loginWithCode } from "shared/api/auth";

import { initialState, reducer, PHONE_LENGTH, CODE_LENGTH } from "./state";

import {
  SetPhone,
  StartCodeRequest,
  CodeRequestSuccess,
  CodeRequestFail,
  SetCode,
  StartLoginWithCode,
  LoginWithCodeSuccess,
  LoginWithCodeFail
} from "./action";

/**
 * Context for React Component
 */
interface Context {
  phone: string;
  setPhone: Function;
  canStartCodeRequest: boolean;
  startCodeRequest: Function;
  errorMessage: string;
  codeInputFlag: boolean;
  code: string;
  setCode: Function;
  isLoading: boolean;
}

const defaultAuth: Context = {
  phone: initialState.phone,
  setPhone: new Function(),
  canStartCodeRequest: false,
  startCodeRequest: new Function(),
  errorMessage: initialState.errorMessage,
  codeInputFlag: initialState.codeInputFlag,
  code: initialState.code,
  setCode: new Function(),
  isLoading: initialState.isLoading
};

const ContextFactory = React.createContext<Context>(defaultAuth);

/**
 * Provider
 */
export function Provider({ children }: { children: React.ReactNode }) {
  const [
    { phone, isLoading, errorMessage, codeInputFlag, code },
    dispatch
  ] = React.useReducer(reducer, initialState);

  const setPhone = (phone: string) => dispatch(new SetPhone(phone));

  const canStartCodeRequest = phone.length === PHONE_LENGTH && !isLoading;

  const startCodeRequest = () => {
    dispatch(new StartCodeRequest());

    requestCode(phone)
      .then((resp: string) => {
        dispatch(new CodeRequestSuccess(resp));
      })
      .catch((err: Error) => {
        dispatch(new CodeRequestFail(err.message));
      });
  };

  const setCode = (code: string) => {
    dispatch(new SetCode(code));
  };

  React.useEffect(() => {
    if (code.length === CODE_LENGTH) {
      dispatch(new StartLoginWithCode());

      loginWithCode(phone, code)
        .then(() => {
          dispatch(new LoginWithCodeSuccess());
        })
        .catch((err: Error) => {
          dispatch(new LoginWithCodeFail(err.message));
        });
    }
  }, [code]);

  const context: Context = {
    phone,
    setPhone,
    canStartCodeRequest,
    startCodeRequest,
    errorMessage,
    codeInputFlag,
    code,
    setCode,
    isLoading
  };

  return (
    <ContextFactory.Provider value={context}>
      {children}
    </ContextFactory.Provider>
  );
}

export const getContext = () => React.useContext(ContextFactory);
