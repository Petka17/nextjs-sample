import axios, { AxiosResponse } from "axios";

import { requestCode, createCodeRequestBody, codeRequestUrl } from "../auth";

const createAxiosResponse = (
  data: object,
  status: number = 200,
  statusText: string = "OK"
): AxiosResponse => ({
  status,
  statusText,
  data,
  headers: [],
  config: {}
});

jest.mock("axios");

const mockedAxios: jest.Mock = axios as jest.Mocked<any>;

afterEach(() => {
  mockedAxios.mockClear();
});

test("when http request for new code succeed requestCode should return external ID", async () => {
  const phone = "75551231212";
  const requestBody = createCodeRequestBody(phone);
  const externalId = "75c8e60e-7590-4a44-aed3-6898804bedaf";

  mockedAxios.mockResolvedValue(
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

  expect(mockedAxios).toBeCalledTimes(1);
  expect(mockedAxios).toBeCalledWith({
    url: codeRequestUrl,
    method: "post",
    data: requestBody
  });
  expect(response).toBe(externalId);
});

test("when http request for the new code succeed but in the response success field equal false then requestCode should fail", async () => {
  const message = "Пользователь не найден";
  mockedAxios.mockResolvedValue(
    Promise.reject({
      response: createAxiosResponse(
        {
          message,
          success: false
        },
        400,
        "Bad Request"
      )
    })
  );

  await requestCode("75551231212")
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe(message);
    });
});
