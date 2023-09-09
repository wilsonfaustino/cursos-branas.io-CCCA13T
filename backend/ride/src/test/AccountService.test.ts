import AccountService from "../AccountService";

const baseInput = () => ({
  name: "John Doe",
  email: `john.doe${Math.random()}@gmail.com`,
  cpf: "95818705552",
  isPassenger: true,
});

describe("AccountService", () => {
  test("Should create a passenger account", async () => {
    const input = {
      ...baseInput(),
    };
    const accountService = new AccountService();
    const output = await accountService.signup(input);
    const account = await accountService.getAccount(output.accountId);
    expect(account.account_id).toBeDefined();
    expect(account.name).toBe(input.name);
    expect(account.email).toBe(input.email);
    expect(account.cpf).toBe(input.cpf);
  });

  test("Should not create a passenger account with invalid cpf", async () => {
    const input = {
      ...baseInput(),
      cpf: "95818705500",
    };
    const accountService = new AccountService();
    await expect(() => accountService.signup(input)).rejects.toThrow(
      "Invalid cpf"
    );
  });

  test("Should not create a passenger account with invalid name", async () => {
    const input = {
      ...baseInput(),
      name: "John",
    };
    const accountService = new AccountService();
    await expect(() => accountService.signup(input)).rejects.toThrow(
      "Invalid name"
    );
  });

  test("Should not create a passenger account with invalid email", async () => {
    const input = {
      ...baseInput(),
      email: `john.doe${Math.random()}@`,
    };
    const accountService = new AccountService();
    await expect(() => accountService.signup(input)).rejects.toThrow(
      "Invalid email"
    );
  });

  test("Should not create a passenger account with existing account", async () => {
    const input = {
      ...baseInput(),
    };
    const accountService = new AccountService();
    await accountService.signup(input);
    await expect(() => accountService.signup(input)).rejects.toThrow(
      "Account already exists"
    );
  });

  test("Should create a driver account", async () => {
    const input = {
      ...baseInput(),
      isPassenger: false,
      carPlate: "AAA9999",
      isDriver: true,
    };
    const accountService = new AccountService();
    const output = await accountService.signup(input);
    const account = await accountService.getAccount(output.accountId);
    expect(account.account_id).toBeDefined();
    expect(account.name).toBe(input.name);
    expect(account.email).toBe(input.email);
    expect(account.cpf).toBe(input.cpf);
  });

  test("Should not create a driver account with invalid plate", async () => {
    const input = {
      ...baseInput(),
      isPassenger: false,
      isDriver: true,
      carPlate: "AAA99",
    };
    const accountService = new AccountService();
    await expect(() => accountService.signup(input)).rejects.toThrow(
      "Invalid plate"
    );
  });
});
