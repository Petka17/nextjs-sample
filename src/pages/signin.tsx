import React from "react";
import layout from "shared/components/layout";
import * as auth from "shared/state/auth";

function SigninPage() {
  const {
    canStartCodeRequest,
    phone,
    setPhone,
    startCodeRequest,
    errorMessage
  } = auth.getContext();

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };

  const handleSubmitForm = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    startCodeRequest();
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <label htmlFor="phone">Телефон</label>
      <input
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
      {errorMessage !== "" ? <div>{errorMessage}</div> : null}
    </form>
  );
}

export default layout(SigninPage);
