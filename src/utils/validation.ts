export const SUI_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/;

export function validateSuiAddress(address: string): boolean {
  return SUI_ADDRESS_REGEX.test(address);
}

export function validateSuiAddresses(addresses: string[]): { valid: string[]; invalid: string[] } {
  return addresses.reduce(
    (acc, address) => {
      if (validateSuiAddress(address)) {
        acc.valid.push(address);
      } else {
        acc.invalid.push(address);
      }
      return acc;
    },
    { valid: [] as string[], invalid: [] as string[] }
  );
}