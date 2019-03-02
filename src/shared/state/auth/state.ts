import { DeepReadOnly } from "shared/state/common";
import { digitOnly } from "shared/utils/string";

import { Action } from "./action";

/**
 * State
 */
type State = DeepReadOnly<{
  phone: string;
  isLoading: boolean;
  errorMessage: string;
  codeInputFlag: boolean;
  code: string;
}>;

export const initialState: State = {
  phone: "",
  isLoading: false,
  errorMessage: "",
  codeInputFlag: false,
  code: ""
};

/**
 * Reducer
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PHONE": {
      return {
        ...state,
        phone: digitOnly(action.phone).slice(0, 11)
      };
    }
    case "START_CODE_REQUEST": {
      return {
        ...state,
        errorMessage: "",
        isLoading: true
      };
    }
    case "CODE_REQUEST_SUCCESS": {
      return {
        ...state,
        isLoading: false,
        codeInputFlag: true
      };
    }
    case "CODE_REQUEST_FAIL": {
      return {
        ...state,
        isLoading: false,
        errorMessage: action.errorMessage
      };
    }
    case "SET_CODE": {
      return {
        ...state,
        code: digitOnly(action.code).slice(0, 4)
      };
    }
    /* istanbul ignore next */
    default: {
      /* istanbul ignore next */
      const unreachableAction: never = action;
      /* istanbul ignore next */
      return unreachableAction;
    }
  }
};
