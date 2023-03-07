export interface EventDetail {
  name: string;
  date: string;
  time: string;
  artist: string[];
  genre: string;
  venue_id: string;
  venue: string;
  price: string;
  status: string;
  status_color: string;
  buy: string;
  seatmap: string;
}

export interface EventDetailData {
  event_detail?: EventDetail;
}
