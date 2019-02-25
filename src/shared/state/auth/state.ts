import { DeepReadOnly } from "shared/state/common";
import { clearPhone } from "shared/utils/string";

import Action from "./action";

/**
 * State
 */
type State = DeepReadOnly<{
  phone: string;
  isLoading: boolean;
  errorMessage: string;
}>;

export const initialState: State = {
  phone: "",
  isLoading: false,
  errorMessage: ""
};

/**
 * Reducer
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_PHONE": {
      return {
        ...state,
        phone: clearPhone(action.phone).slice(0, 11)
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
        isLoading: false
      };
    }
    case "CODE_REQUEST_FAIL": {
      return {
        ...state,
        isLoading: false,
        errorMessage: action.errorMessage
      };
    }
    default: {
      /* istanbul ignore next */
      const unreachableAction: never = action;
      /* istanbul ignore next */
      return unreachableAction;
    }
  }
};
