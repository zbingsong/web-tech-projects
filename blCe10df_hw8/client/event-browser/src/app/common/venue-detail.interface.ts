export interface VenueDetail {
  name: string;
  address: string;
  phone: string;
  openHours: string;
  genRule: string;
  childRule: string;
  location: {
    lat: number;
    lng: number;
  };
}
