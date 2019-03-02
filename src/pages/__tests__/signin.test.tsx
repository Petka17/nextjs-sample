import React from "react";
import { fireEvent, render, wait } from "react-testing-library";

import SigninPage from "../signin";
import { requestCode } from "shared/api/auth";

jest.mock("shared/api/auth", () => {
  return {
    requestCode: jest.fn(
      () =>
        new Promise((resolve, _) => {
          let wait = setTimeout(() => {
            clearTimeout(wait);
            resolve("auth_token");
          }, 500);
        })
    )
  };
});

const mockRequestCode: jest.Mock = requestCode as jest.Mock;

const renderPage = (phone = "") => {
  const utils = render(<SigninPage />);
  const phoneInput = utils.getByLabelText(/Телефон/) as HTMLInputElement;
  const requestCodeButton = utils.getByText(
    /Запросить код/
  ) as HTMLButtonElement;

  const fillPhone = (phone: string) => {
    fireEvent.change(phoneInput, { target: { value: phone } });
  };

  if (phone !== "") fillPhone(phone);

  return {
    ...utils,
    fillPhone,
    phoneInput,
    requestCodeButton
  };
};

afterEach(() => {
  mockRequestCode.mockClear();
});

test("Signin page should have phone input and submit button, and input should be focused", () => {
  const { phoneInput, requestCodeButton } = renderPage();

  expect(phoneInput).toHaveAttribute("type", "tel");
  expect(phoneInput).toHaveFocus(); // not working properly
  expect(requestCodeButton).toBeDisabled();
});

test("Signin page input should clear all non number character, apply formatting and not allow more than 11 numbers", () => {
  const { phoneInput, fillPhone } = renderPage();

  const phone = "75551*2f34)567er234";
  const clearedPhone = "75551234567";

  fillPhone(phone);

  expect(phoneInput.value).toBe(clearedPhone);
});

test("Signin page submit button should become enabled only if user fill correct phone", () => {
  const { requestCodeButton, fillPhone } = renderPage();

  expect(requestCodeButton).toBeDisabled();
  fillPhone("7555111223");
  expect(requestCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(requestCodeButton).toBeEnabled();
  fillPhone("75551112");
  expect(requestCodeButton).toBeDisabled();
  fillPhone("75551112233");
  expect(requestCodeButton).toBeEnabled();
});

test("When submit button is clicked, code request should fire and button should become disabled", async () => {
  const phone = "75551112233";
  const { requestCodeButton, getByLabelText } = renderPage(phone);

  expect(requestCodeButton).toBeEnabled();

  fireEvent.click(requestCodeButton);

  expect(mockRequestCode).toBeCalledTimes(1);
  expect(mockRequestCode).toBeCalledWith(phone);

  expect(requestCodeButton).toBeDisabled();

  await wait(() => expect(getByLabelText(/Код/)).toBeInTheDocument(), {
    timeout: 600
  });
});

test("If there are any errors in requesting code, the should be shown under the input", async () => {
  const error = new Error("error");
  const { requestCodeButton, getByText, queryByText } = renderPage(
    "75551112233"
  );

  mockRequestCode.mockReturnValueOnce(Promise.reject(error));
  fireEvent.click(requestCodeButton);
  await wait(() => expect(getByText(error.message)).toBeInTheDocument());

  expect(requestCodeButton).toBeEnabled();

  fireEvent.click(requestCodeButton);
  expect(queryByText(error.message)).toBeNull();
});

test("When submit button is clicked and code request fire and code input should be editable", async () => {
  const phone = "75551112233";
  const code = "12jkn24332";
  const clearCode = "1224";

  const { requestCodeButton, getByLabelText, debug } = renderPage(phone);

  mockRequestCode.mockResolvedValueOnce(Promise.resolve("auth_token"));

  fireEvent.click(requestCodeButton);

  await wait(() => expect(getByLabelText(/Код/)).toBeInTheDocument(), {
    timeout: 600
  });

  const codeInput = getByLabelText(/Код/) as HTMLInputElement;

  debug();

  fireEvent.change(codeInput, { target: { value: code } });

  debug();
  expect(codeInput.value).toBe(clearCode);
});
