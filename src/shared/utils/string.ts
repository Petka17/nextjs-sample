function clearPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export { clearPhone };
