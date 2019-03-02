import axios, { AxiosError } from "axios";
import * as _ from "jsonous";
import { err, Result } from "resulty";

export const createCodeRequestBody = (phone: string) => ({
  phone
});

export const codeRequestUrl = "/api/login/request_code";

const successDecoder = _.succeed({}).assign(
  "success",
  _.field("success", _.boolean)
);

const externalIdDecoder = _.succeed({}).assign(
  "id",
  _.at(["data", "external_id"], _.string)
);

const errorMessageDecoder = _.succeed({}).assign(
  "message",
  _.field("message", _.string)
);

export const requestCode = (phone: string) =>
  axios
    .post(codeRequestUrl, createCodeRequestBody(phone))
    .then(({ data }) =>
      successDecoder
        .decodeAny(data)
        .mapError(err => `Parsing error for initial message: ${err}`)
        .andThen(({ success }: { success: boolean }) =>
          success
            ? externalIdDecoder
                .decodeAny(data)
                .mapError(err => `Parsing error: ${err}`)
            : errorMessageDecoder
                .decodeAny(data)
                .mapError(() => "Unknown error")
                .andThen(({ message }) => err(message))
        )
    )
    .then((result: Result<string, { id?: string }>) => {
      let id = "";
      result.cata({
        Ok: v => {
          id = v.id || "";
        },
        Err: err => {
          throw new Error(err);
        }
      });
      return id;
    })
    .catch((err: AxiosError) => {
      console.log(err);
      const { response } = err;
      const message = _.at(["data", "message"], _.string).decodeAny(response);

      message.cata({
        Ok: msg => {
          throw new Error(msg);
        },
        Err: () => {
          if (response && response.statusText) {
            throw new Error(response.statusText);
          }
          throw new Error("Unknown error");
        }
      });
    });
