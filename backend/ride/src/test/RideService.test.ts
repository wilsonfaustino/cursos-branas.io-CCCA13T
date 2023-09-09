import AccountService from "../AccountService";
import RideService from "../RideService";

async function createAccont(type: "passenger" | "driver") {
  const accInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "95818705552",
    isPassenger: type === "passenger",
    isDriver: type === "driver",
    carPlate: type === "driver" ? "AAA9999" : null,
  };
  const accountService = new AccountService();
  const createAccount = await accountService.signup(accInput);
  const account = await accountService.getAccount(createAccount.accountId);
  return account;
}

async function createRide(passengerId: string) {
  const rideInput = {
    accountId: passengerId,
    from: { lat: 0, long: 0 },
    to: { lat: 0, long: 0 },
  };
  const rideService = new RideService();
  const output = await rideService.create(rideInput);
  return output;
}

describe("RideService - requestRide - Actor => Passenger", () => {
  test("Should create a ride and return the ride id", async () => {
    const passengerAccount = await createAccont("passenger");
    const output = await createRide(passengerAccount.account_id);
    expect(output).toBeDefined();
  });

  test("Should throw an error if account does not have is_passenger property set to true", async () => {
    const driverAccount = await createAccont("driver");
    await expect(() => createRide(driverAccount.account_id)).rejects.toThrow(
      "Account does not belong to a passenger"
    );
  });

  test("Should throw an error if user has a ride with status other than completed", async () => {
    const passengerAccount = await createAccont("passenger");
    await createRide(passengerAccount.account_id);
    await expect(() => createRide(passengerAccount.account_id)).rejects.toThrow(
      "Passenger is already on a ride"
    );
  });

  test("Should create a ride with status 'requested'", async () => {
    const rideService = new RideService();
    const passengerAccount = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const ride = await rideService.getRideById(newRide.rideId);
    expect(ride.status).toBe("requested");
  });
  test("Should create a ride with Date equal to Date", async () => {
    const passengerAccount = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const rideService = new RideService();
    const ride = await rideService.getRideById(newRide.rideId);
    expect(ride.date).toBeInstanceOf(Date);
  });
});

describe("RideService - acceptRide - Actor => Driver", () => {
  test("Should throw an error if account does not have is_driver property set to true", async () => {
    const passengerAccount = await createAccont("passenger");
    const passenger2Account = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const rideService = new RideService();
    await expect(() =>
      rideService.acceptRide({
        rideId: newRide.rideId,
        driverId: passenger2Account.account_id,
      })
    ).rejects.toThrow("Account does not belong to a driver");
  });

  test("Should throw an error if ride status is not 'requested'", async () => {
    const passengerAccount = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const driverAccount = await createAccont("driver");
    const rideService = new RideService();
    jest
      .spyOn(rideService, "getRideById")
      .mockResolvedValue({ status: "completed" });
    await expect(() =>
      rideService.acceptRide({
        rideId: newRide.rideId,
        driverId: driverAccount.account_id,
      })
    ).rejects.toThrow("Ride is not available for acceptance");
  });

  test("Should throw an error if driver has a ride with status other than completed", async () => {
    const passengerAccount = await createAccont("passenger");
    const passenger2Account = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const newRide2 = await createRide(passenger2Account.account_id);
    const driverAccount = await createAccont("driver");
    const rideService = new RideService();
    await rideService.acceptRide({
      rideId: newRide.rideId,
      driverId: driverAccount.account_id,
    });
    await expect(() =>
      rideService.acceptRide({
        rideId: newRide2.rideId,
        driverId: driverAccount.account_id,
      })
    ).rejects.toThrow("Driver is already on a ride");
  });

  test("Should set driver_id to the id of the driver", async () => {
    const passengerAccount = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const driverAccount = await createAccont("driver");
    const rideService = new RideService();
    await rideService.acceptRide({
      rideId: newRide.rideId,
      driverId: driverAccount.account_id,
    });
    const ride = await rideService.getRideById(newRide.rideId);
    expect(ride.driver_id).toBe(driverAccount.account_id);
  });
  
  test("Should set the status of the ride to 'accepted'", async () => {
    const passengerAccount = await createAccont("passenger");
    const newRide = await createRide(passengerAccount.account_id);
    const driverAccount = await createAccont("driver");
    const rideService = new RideService();
    await rideService.acceptRide({
      rideId: newRide.rideId,
      driverId: driverAccount.account_id,
    });
    const ride = await rideService.getRideById(newRide.rideId);
    expect(ride.status).toBe("accepted");
  });
});
