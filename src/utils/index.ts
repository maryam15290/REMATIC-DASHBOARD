export const validateAddress = (address: string) =>
  /^0x[a-f0-9A-F]{40}$/.test(address);
