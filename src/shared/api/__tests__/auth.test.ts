import axios, { AxiosResponse } from "axios";
import { loginWithCode, loginWithCodeUrl } from "../auth";

import {
  codeRequest,
  createCodeRequestBody,
  codeRequestUrl,
  createLoginWithCodeBody
} from "../auth";

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

  const response = await codeRequest(phone);

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

  await codeRequest("75551231212")
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe(message);
    });
});

test("when http request for login with code succeed loginWith should return authToken", async () => {
  const phone = "75551231212";
  const code = "1234";
  const requestBody = createLoginWithCodeBody(phone, code);
  const externalId = "75c8e60e-7590-4a44-aed3-6898804bedaf";
  const authToken = "secret_token";

  mockedAxios.mockResolvedValue(
    Promise.resolve(
      createAxiosResponse({
        success: true,
        data: {
          auth_token: authToken,
          demo: false,
          external_id: externalId
        }
      })
    )
  );

  const response = await loginWithCode(phone, code);

  expect(mockedAxios).toBeCalledTimes(1);
  expect(mockedAxios).toBeCalledWith({
    url: loginWithCodeUrl,
    method: "post",
    data: requestBody
  });
  expect(response).toBe(authToken);
});

test("when http request for the new code succeed but in the response success field equal false then requestCode should fail", async () => {
  const phone = "75551231212";
  const code = "1234";

  const message = "Некорректно заполнены данные";
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

  await loginWithCode(phone, code)
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe(message);
    });
});
