import Result from "resulty/Result";
import { Just } from "maybeasy";
import axios, { AxiosResponse, AxiosError } from "axios";
import * as _ from "jsonous";

import { makeRequest } from "../utils";
import { succeedResponseDecoder } from "../utils";

jest.mock("axios");

const mockedAxios: jest.Mock = axios as jest.Mocked<any>;

afterEach(() => {
  mockedAxios.mockClear();
});

test("Decode data in response should work properly", () => {
  const exampleData = { a: 1 };
  const result = succeedResponseDecoder.decodeAny({
    success: true,
    data: exampleData
  });

  expect(result).toBeInstanceOf(Result);

  result.cata({
    Ok: responseData => {
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeInstanceOf(Just);

      responseData.data.cata({
        Just: data => {
          expect(data).toEqual(exampleData);
        },
        Nothing: () => {
          fail("Data should be present");
        }
      });
    },
    Err: () => {
      fail("Decode should be succeed");
    }
  });
});

const createAxiosResponse = (
  data: any = {},
  status: number = 200,
  statusText: string = "OK"
): AxiosResponse => ({
  status,
  statusText,
  data,
  headers: {},
  config: {}
});

const createAxiosError = (response: AxiosResponse): AxiosError => ({
  name: "",
  message: "",
  config: {},
  response
});

const makeRequestErrorCheck = async (msg: string | RegExp) => {
  await makeRequest("/", "post", {}, _.string)
    .then(() => {
      fail("It should fail");
    })
    .catch(e => {
      if (typeof msg === "string") {
        expect(e.message).toBe(msg);
      } else {
        expect(e.message).toEqual(expect.stringMatching(msg));
      }
    });
};

test("Process error response should return error message", async () => {
  const unknownError = "Unknown server error";
  const statusText = "Error on the server";
  const message = "Something went wrong";

  // No response
  mockedAxios.mockResolvedValueOnce(Promise.reject({}));
  await makeRequestErrorCheck(unknownError);

  // No data, but status
  mockedAxios.mockResolvedValueOnce(
    Promise.reject(createAxiosError(createAxiosResponse({}, 500, statusText)))
  );
  await makeRequestErrorCheck(statusText);

  // No message in data, but status
  mockedAxios.mockResolvedValueOnce(
    Promise.reject({
      response: { status: 400, statusText, data: { success: true } }
    })
  );
  await makeRequestErrorCheck(statusText);

  // Message in data and status
  mockedAxios.mockResolvedValueOnce(
    Promise.reject(
      createAxiosError(
        createAxiosResponse({ success: false, message }, 500, statusText)
      )
    )
  );
  await makeRequestErrorCheck(message);

  mockedAxios.mockResolvedValueOnce(
    Promise.resolve(createAxiosResponse({ success: "false" }))
  );
  await makeRequestErrorCheck(/Successful response decoder failed/);

  mockedAxios.mockResolvedValueOnce(
    Promise.resolve(createAxiosResponse({ success: false }))
  );
  await makeRequestErrorCheck(/Successful response decoder failed/);

  mockedAxios.mockResolvedValueOnce(
    Promise.resolve(createAxiosResponse({ success: false, message }))
  );
  await makeRequestErrorCheck(/Successful response decoder failed/);

  mockedAxios.mockResolvedValueOnce(
    Promise.resolve(createAxiosResponse({ success: true }))
  );
  await makeRequestErrorCheck(/Server data decoder failed/);
});

test("Process success case", async () => {
  const field = "value";

  // mockedAxios.mockResolvedValue(
  //   Promise.resolve(createAxiosResponse({ success: true }))
  // );

  // await makeRequest("/", "post", {}, new Decoder(() => ok(null)))
  //   .then((result: any) => {
  //     expect(result).toBeNull();
  //   })
  //   .catch(e => {
  //     fail(`makeRequest failed with error: ${e}`);
  //   });

  mockedAxios.mockResolvedValue(
    Promise.resolve(createAxiosResponse({ success: true, data: { field } }))
  );

  await makeRequest("/", "post", {}, _.field("field", _.string))
    .then(result => {
      expect(result).toBe(field);
    })
    .catch(e => {
      fail(`makeRequest failed with error: ${e}`);
    });

  await makeRequest("/", "post", {}, _.field("field", _.number))
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e.message).toEqual(
        expect.stringMatching(/Server data decoder failed/)
      );
    });
});
