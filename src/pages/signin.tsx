import React from "react";
import layout from "shared/components/layout";
import * as auth from "shared/state/auth";

function SigninPage() {
  const {
    canStartCodeRequest,
    phone,
    setPhone,
    startCodeRequest,
    errorMessage,
    codeInputFlag,
    code,
    setCode
  } = auth.getContext();

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };

  const handleSubmitForm = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    startCodeRequest();
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  return (
    <form onSubmit={handleSubmitForm}>
      {codeInputFlag ? (
        <React.Fragment>
          <label key="label-code" htmlFor="code">
            Код
          </label>
          <input
            key="code"
            type="tel"
            name="code"
            id="code"
            autoFocus
            value={code}
            onChange={handleCodeChange}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <label key="label-phone" htmlFor="phone">
            Телефон
          </label>
          <input
            key="phone"
            type="tel"
            name="phone"
            id="phone"
            autoFocus
            value={phone}
            onChange={handlePhoneChange}
          />
          <button type="submit" disabled={!canStartCodeRequest}>
            Запросить код
          </button>
        </React.Fragment>
      )}
      {errorMessage !== "" ? <div>{errorMessage}</div> : null}
    </form>
  );
}

export default layout(SigninPage);
