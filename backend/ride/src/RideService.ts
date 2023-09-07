import pgp from 'pg-promise';
export default class RideService {
  
  async createRide (ride: any) {
    const connection = pgp()("postgres://postgres:pass123@localhost:5432/app");
    try {
      const rideId = crypto.randomUUID();
      const date = new Date();
    } finally {
      await connection.$pool.end();
    }
  }
}