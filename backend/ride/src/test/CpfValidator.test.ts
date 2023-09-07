import CpfValidator from "../CpfValidator";

const validCases = ["95818705552", "01234567890", "565.486.780-60", "147.864.110-00"];
const invalidCases = ["958.187.055-00", "958.187.055", "11111111111", ""];

describe("CpfValidator", () => {
  test.each(validCases)("Should validate cpf %p", (cpf: string) => {
    const validator = new CpfValidator();
    expect(validator.validate(cpf)).toBeTruthy();
  });

  test.each(invalidCases)("Should not validate cpf %p", (cpf: string) => {
    const validator = new CpfValidator();
    expect(validator.validate(cpf)).toBeFalsy();
  });
});
