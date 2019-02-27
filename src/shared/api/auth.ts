import axios, { AxiosError } from "axios";
import * as _ from "jsonous";
import { succeed } from "jsonous";

export const createCodeRequestBody = (phone: string) => ({
  phone
});

export const codeRequestUrl = "/api/login/request_code";

// TODO: Refactor decoders
export const requestCode = (phone: string) =>
  axios
    .post(codeRequestUrl, createCodeRequestBody(phone))
    .then(response => {
      const parsedResult = _.succeed({})
        .assign("success", _.field("success", _.boolean))
        .decodeAny(response.data);

      let result: string = "no_result";

      parsedResult.cata({
        Ok: ({ success }) => {
          if (success) {
            const dataResult = succeed({})
              .assign("id", _.at(["data", "external_id"], _.string))
              .decodeAny(response.data);

            dataResult.cata({
              Ok: ({ id }) => {
                result = id;
              },
              Err: error => {
                throw new Error("Parsing error " + error);
              }
            });
          } else {
            const errorResult = succeed({})
              .assign("message", _.field("message", _.string))
              .decodeAny(response.data);

            errorResult.cata({
              Ok: ({ message }) => {
                throw new Error(message);
              },
              Err: () => {
                throw new Error("Unknown error");
              }
            });
          }
        },
        Err: error => {
          throw new Error("Parsing error for initial message " + error);
        }
      });

      return result;
    })
    .catch((er: AxiosError) => {
      throw new Error(er.message);
    });
