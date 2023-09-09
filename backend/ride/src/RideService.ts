import crypto from "crypto";
import pgp from "pg-promise";
import AccountService from "./AccountService";
import type { CreateRideInput } from "./types";

export default class RideService {
  AccountService: AccountService;

  constructor() {
    this.AccountService = new AccountService();
  }

  async create(input: CreateRideInput) {
    const connection = pgp()("postgres://postgres:pass123@localhost:5432/app");
    try {
      const rideId = crypto.randomUUID();
      const date = new Date();
      const accountInfo = await this.AccountService.getAccount(input.accountId, connection);
      if (!accountInfo.is_passenger) throw new Error("Account does not belong to a passenger");
      if (await this.isPassengerOnAnyRide(input.accountId, connection)) throw new Error("Passenger is already on a ride");
      await connection.query("insert into cccat13.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", [ rideId, input.accountId, null, "requested", 0, 0, input.from.lat, input.from.long, input.to.lat, input.to.long, date,]);

      return { rideId };
    } finally {
      await connection.$pool.end();
    }
  }

  async getRideById (rideId: string, externalConnection?: any) {
    const connection = externalConnection ?? pgp()("postgres://postgres:pass123@localhost:5432/app");
		const [ride] = await connection.query("select * from cccat13.ride where ride_id = $1", [rideId]);
		!externalConnection && await connection.$pool.end();
		return ride;
  }

  async getRidesByPassengerId (passengerId: string) {
    const connection = pgp()("postgres://postgres:pass123@localhost:5432/app");
		const rides = await connection.query("select * from cccat13.ride where passenger_id = $1", [passengerId]);
		await connection.$pool.end();
		return rides;
  }

  async isPassengerOnAnyRide (passengerId: string, connection: any) {
    const rides = await connection.query("select * from cccat13.ride where passenger_id = $1", [passengerId]);
    return rides.some((ride: any) => ride.status !== "completed");
  }

  async isDriverOnAnyRide (rideId: string, driverId: string, connection: any) {
    const rides = await connection.query("select * from cccat13.ride where driver_id = $1 and ride_id <> $2", [driverId, rideId]);
    return rides.some((ride: any) => ride.status !== "completed");
  }

  async acceptRide (input: {rideId: string, driverId: string}) {
    const connection = pgp()("postgres://postgres:pass123@localhost:5432/app");
    try {
      const accountInfo = await this.AccountService.getAccount(input.driverId, connection);
      if (!accountInfo.is_driver) throw new Error("Account does not belong to a driver");
      const rideInfo = await this.getRideById(input.rideId, connection);
      if (rideInfo.status !== "requested") throw new Error("Ride is not available for acceptance");
      if (await this.isDriverOnAnyRide(input.rideId, input.driverId, connection)) throw new Error("Driver is already on a ride");
      await connection.query("update cccat13.ride set driver_id = $1, status = 'accepted' where ride_id = $2", [input.driverId, input.rideId]);
      return { rideId: input.rideId };
    } finally {
      await connection.$pool.end();
    }
  }
}
