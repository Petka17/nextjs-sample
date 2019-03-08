import axios, { AxiosError } from "axios";
import Decoder, * as _ from "jsonous";
import { Maybe } from "maybeasy";
import { ok, err } from "resulty";

/**
 * Custom Decoders
 */
const identity = new Decoder(v => ok(v));
const trueVal = new Decoder<true>(v =>
  v === true ? ok<string, true>(true) : err("expected true value")
);
const falseVal = new Decoder<false>(v =>
  v === false ? ok<string, false>(false) : err("expected false value")
);

/**
 * {
 *    "success": true,
 *    "data": {
 *      "field": "value"
 *    }
 * }
 */
type DecodedSucceedResponseData = {
  success: true;
  data: Maybe<any>;
};

type DecodeResult = [DecodedSucceedResponseData | null, string];

export const succeedResponseDecoder: Decoder<
  DecodedSucceedResponseData
> = _.succeed({})
  .assign("success", _.field("success", trueVal))
  .assign("data", _.maybe(_.field("data", identity)));

/**
 * {
 *    "success": false,
 *    "message": "Error test"
 * }
 */
type DecodedFailedResponseData = {
  success: false;
  errorMessage: string;
};

type DecodeFailedResult = [DecodedFailedResponseData | null, string];

export const failedResponseDecoder: Decoder<
  DecodedFailedResponseData
> = _.succeed({})
  .assign("success", _.field("success", falseVal))
  .assign("errorMessage", _.field("message", _.string));

export function makeRequest<T>(
  url: string,
  method: string,
  body: any,
  serverDataDecoder: Decoder<T>
): Promise<T>;
export function makeRequest(
  url: string,
  method: string,
  body: any
): Promise<void>;
export async function makeRequest<T>(
  url: string,
  method: string,
  body: any,
  serverDataDecoder?: Decoder<T>
): Promise<T | void> {
  const [maybeServerData, errorMessage] = await makeAndDecodeResponse(
    url,
    method,
    body
  );

  if (errorMessage !== "" || maybeServerData === null) {
    throw new Error(errorMessage);
  }

  if (!serverDataDecoder) {
    return;
  }

  const serverData = maybeServerData.data.getOrElseValue(null);

  const [data, decodeError] = serverDataDecoder
    .decodeAny(serverData)
    .cata<[T | null, string]>({
      Ok: val => [val, ""],
      Err: msg => [null, msg]
    });

  if (decodeError !== "" || data === null) {
    throw new Error(`Server data decoder failed: ${decodeError}`);
  }

  return data;
}

const makeAndDecodeResponse = async (
  url: string,
  method: string,
  body: any
): Promise<DecodeResult> => {
  try {
    const { data: responseData } = await axios({ url, method, data: body });

    return succeedResponseDecoder.decodeAny(responseData).cata<DecodeResult>({
      Ok: val => [val, ""],
      Err: msg => [null, `Successful response decoder failed: ${msg}`]
    });
  } catch (axiosError) {
    if (!axiosError.response) {
      return [null, "Unknown server error"];
    }

    const {
      response: { data, statusText }
    }: AxiosError = axiosError;

    const [serverData] = failedResponseDecoder
      .decodeAny(data)
      .cata<DecodeFailedResult>({
        Ok: val => [val, ""],
        Err: msg => [null, msg]
      });

    if (serverData) {
      return [null, serverData.errorMessage];
    }

    return [null, statusText];
  }
};
