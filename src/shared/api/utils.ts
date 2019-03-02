import Decoder, * as _ from "jsonous";
import { ok } from "resulty";
import axios from "axios";

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
export const responseDataDecoder = _.succeed({})
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
export const responseDecoder = _.succeed({})
  .assign("responseData", _.maybe(_.field("data", responseDataDecoder)))
  .assign("statusText", _.maybe(_.field("statusText", _.string)));

export const makeRequest = async (
  url: string = "/",
  method: string = "get",
  body: any = null,
  resultDecoder?: Decoder<any>
) => {
  let result: any = null;
  let errorText = "";

  try {
    const { data: responseData } = await axios({ url, method, data: body });

    // response status is successful
    responseDataDecoder.decodeAny(responseData).cata({
      Ok: responseData => {
        // Result of data decoder is successful
        if (responseData.success) {
          // Success field is true
          if (resultDecoder) {
            // if there is result decoder data field should be passed though it
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
          }
        } else {
          // Success field is false
          responseData.errorMessage.cata({
            Just: errorMessage => {
              // there is error message
              errorText = errorMessage;
            },
            Nothing: () => {
              // there is not error message
              errorText = "There was unknown issue on the server";
            }
          });
        }
      },
      Err: msg => {
        // Result of data decoder is not successful (instanceof success !== boolean)
        errorText = `Successful response decoder failed: ${msg}`;
      }
    });
  } catch ({ response }) {
    // response status isn't successful
    responseDecoder.decodeAny(response).cata({
      Ok: response => {
        // Error response was decode successfully
        response.responseData.cata({
          Just: responseData => {
            // There is data for error response
            responseData.errorMessage.cata({
              Just: errorMessage => {
                // There is error message in data
                errorText = errorMessage;
              },
              Nothing: () => {
                // There is no error message in data
                response.statusText.cata({
                  Just: statusText => {
                    // There is statusText in response
                    errorText = statusText;
                  },
                  Nothing: () => {
                    // There is no statusText in response
                    errorText = "Unknown server error";
                  }
                });
              }
            });
          },
          Nothing: () => {
            // There is no data in response
            response.statusText.cata({
              Just: statusText => {
                // There is statusText in response
                errorText = statusText;
              },
              Nothing: () => {
                // There is no statusText in response
                errorText = "Unknown server error";
              }
            });
          }
        });
      },
      Err: /* istanbul ignore next */ msg => {
        // Impossible branch
        errorText = `Error response decoder failed: ${msg}`;
      }
    });
  }

  if (errorText !== "") {
    throw new Error(errorText);
  }

  return result;
};
