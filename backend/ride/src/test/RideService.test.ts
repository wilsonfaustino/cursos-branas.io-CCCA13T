describe("RideService - requestRide - Actor => Passenger", () => {
  test.todo("Should create a ride and return the ride id");
  test.todo("Should throw an error if account does not have is_passenger property set to true");
  test.todo("Should throw an error if user has a ride with status other than completed");
  test.todo("Should create a ride with status 'requested'");
  test.todo("Should create a ride with Date equal to Date.now()");
})

describe("RideService - acceptRide - Actor => Driver", () => {
  test.todo("Should throw an error if account does not have is_driver property set to true");
  test.todo("Should throw an error if ride status is not 'requested'");
  test.todo("Should throw an error if driver has a ride with status other than completed");
  test.todo("Should set driver_id to the id of the driver");
  test.todo("Should set the status of the ride to 'accepted'");
})