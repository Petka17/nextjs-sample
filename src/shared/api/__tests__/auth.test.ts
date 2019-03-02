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

test("when http request for new code succeed then requestCode returns external ID", async () => {
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

test("when http request for the new code failed then requestCode returns error message", async () => {
  const message = "Server Error";

  mockedPost.mockResolvedValue(
    Promise.reject({
      response: createAxiosResponse({}, 500, message)
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

test("when http request for the new code succeed but the response is incorrect format then requestCode should fail", async () => {
  mockedPost.mockResolvedValue(
    Promise.resolve(
      createAxiosResponse({
        success: "false"
      })
    )
  );

  await requestCode("75551231212")
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual(expect.stringContaining("boolean"));
    });

  mockedPost.mockResolvedValue(
    Promise.resolve(
      createAxiosResponse({
        success: true,
        data: {
          expires_in: 300,
          external_id: 222,
          timeout_expiration_block: 60
        }
      })
    )
  );

  await requestCode("75551231212")
    .then(() => {
      fail();
    })
    .catch(e => {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toEqual(expect.stringContaining("string"));
    });
});

test("when http request for the new code succeed but in the response success field equal false then requestCode should fail", async () => {
  mockedPost.mockResolvedValue(
    Promise.reject({
      response: createAxiosResponse(
        {
          message: "Пользователь не найден",
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
      expect(e.message).toBe("Пользователь не найден");
    });
});
