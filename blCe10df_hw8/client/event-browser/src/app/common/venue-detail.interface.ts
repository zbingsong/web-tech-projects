export interface VenueDetail {
  name: string;
  icon: string;
  address: string[];
  city: string;
  state: string;
  postal: string;
  upcoming: string;
}

export interface VenueDetailData {
  venue_Detail: VenueDetail;
}
