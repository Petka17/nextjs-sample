import axios from "axios";
import Decoder, * as _ from "jsonous";
import { Maybe } from "maybeasy";
import { ok } from "resulty";

const identity = new Decoder(v => ok(v));

/**
 * {
 *    "success": true,
 *    "data": {
 *      "field": "value"
 *    }
 * }
 *
 * {
 *    "success": false,
 *    "message": "Error test"
 * }
 */
type DecodedResponseData = {
  success: boolean;
} & {
  data: Maybe<any>;
} & {
  errorMessage: Maybe<string>;
};

export const responseDataDecoder: Decoder<DecodedResponseData> = _.succeed({})
  .assign("success", _.field("success", _.boolean))
  .assign("data", _.maybe(_.field("data", identity)))
  .assign("errorMessage", _.maybe(_.field("message", _.string)));

/**
 * {
 *    "response": {
 *      "statusText": "Some test",
 *      "data": {
 *        "success": false,
 *        "message": "Error text"
 *      }
 *    }
 * }
 */
type DecodedResponse = {
  responseData: Maybe<DecodedResponseData>;
} & {
  statusText: Maybe<string>;
};

export const responseDecoder: Decoder<DecodedResponse> = _.succeed({})
  .assign("responseData", _.maybe(_.field("data", responseDataDecoder)))
  .assign("statusText", _.maybe(_.field("statusText", _.string)));

export const makeRequest = async <T>(
  url: string = "/",
  method: string = "get",
  body: any = null,
  resultDecoder: Decoder<T>,
  defaultValue: T
): Promise<T> => {
  let result: T = defaultValue;
  let errorText = "";

  try {
    const { data: responseData } = await axios({ url, method, data: body });

    responseDataDecoder.decodeAny(responseData).cata({
      Ok: responseData => {
        if (responseData.success) {
          [result, errorText] = getData(
            resultDecoder,
            responseData,
            defaultValue
          );
        } else {
          errorText = getErrorFromMessage(responseData);
        }
      },
      Err: msg => {
        errorText = `Successful response decoder failed: ${msg}`;
      }
    });
  } catch ({ response: errorResponse }) {
    errorText = processAxiosError(errorResponse);
  }

  if (errorText !== "") {
    throw new Error(errorText);
  }

  return result;
};

const getData = <T>(
  resultDecoder: Decoder<T>,
  responseData: DecodedResponseData,
  defaultValue: T
): [T, string] => {
  let result: T = defaultValue;
  let errorText = "";

  responseData.data.cata({
    Just: data => {
      resultDecoder.decodeAny(data).cata({
        Ok: responseResult => {
          result = responseResult;
        },
        Err: msg => {
          errorText = `Result decoder failed: ${msg}`;
        }
      });
    },
    Nothing: () => {
      errorText = "No data received";
    }
  });

  return [result, errorText];
};

const getErrorFromMessage = (responseData: DecodedResponseData) => {
  let errorText = "";

  responseData.errorMessage.cata({
    Just: errorMessage => {
      errorText = errorMessage;
    },
    Nothing: () => {
      errorText = "There was unknown issue on the server";
    }
  });

  return errorText;
};

const processAxiosError = (errorResponse: any) => {
  let errorText = "";

  responseDecoder.decodeAny(errorResponse).cata({
    Ok: response => {
      response.responseData.cata({
        Just: responseData => {
          responseData.errorMessage.cata({
            Just: errorMessage => {
              errorText = errorMessage;
            },
            Nothing: () => {
              errorText = getErrorFromStatus(response);
            }
          });
        },
        Nothing: () => {
          errorText = getErrorFromStatus(response);
        }
      });
    },
    Err: /* istanbul ignore next */ msg => {
      errorText = `Error response decoder failed: ${msg}`;
    }
  });

  return errorText;
};

const getErrorFromStatus = (response: DecodedResponse) => {
  let errorText = "";

  response.statusText.cata({
    Just: statusText => {
      errorText = statusText;
    },
    Nothing: () => {
      errorText = "Unknown server error";
    }
  });

  return errorText;
};
