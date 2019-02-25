import axios, { AxiosResponse } from "axios";

import { requestCode, createCodeRequestBody, codeRequestUrl } from "../auth";

const createAxiosResponse = (
  data: object,
  status: number = 200,
  statusText: string = "OK"
): AxiosResponse => ({
  status,
  statusText,
  headers: [],
  config: {},
  data
});

jest.mock("axios");

const post = axios.post;
const mockedPost: jest.Mock = post as jest.Mock;

afterEach(() => {
  mockedPost.mockClear();
});

test("if http request for new code succeed then it returns some data", async () => {
  const phone = "75551231212";
  const requestBody = createCodeRequestBody(phone);
  const externalId = "75c8e60e-7590-4a44-aed3-6898804bedaf";

  mockedPost.mockResolvedValue(
    Promise.resolve(
      createAxiosResponse({
        success: true,
        data: {
          expires_in: 300,
          external_id: externalId,
          timeout_expiration_block: 60
        }
      })
    )
  );

  const response = await requestCode(phone);

  expect(mockedPost).toBeCalledTimes(1);
  expect(mockedPost).toBeCalledWith(codeRequestUrl, requestBody);
  expect(response).toBe(externalId);
});
