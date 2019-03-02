function digitOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export { digitOnly };
