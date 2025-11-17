export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  type: 'consultation' | 'course' | 'online';
  created_at: string;
}

export interface ServiceFeature {
  id: string;
  service_id: string;
  feature: string;
  created_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
  created_at: string;
}

export interface Album {
  id: string;
  title: string;
  year: string;
  cover_url: string;
  created_at: string;
}

export interface Track {
  id: string;
  album_id: string;
  title: string;
  duration: string;
  audio_url: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
  type: 'music' | 'coaching';
  created_at: string;
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  role: string;
  image_url: string;
  type: 'music' | 'coaching';
  created_at: string;
}