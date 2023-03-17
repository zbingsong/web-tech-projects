export interface EventDetail {
  id: string;
  name: string;
  date: string;
  time: string;
  artists: Array<{ name: string; category: string }>;
  genre: string;
  category: string;
  venue_id: string;
  venue: string;
  price: string;
  status: string;
  status_color: string;
  buy: string;
  seatmap: string;
}
