export type LatLong = {
  lat: number;
  long: number;
};

export type CreateRideInput = {
  accountId: string;
  from: LatLong;
  to: LatLong;
}
