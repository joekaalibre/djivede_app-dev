export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

export interface MusicTrack {
  id: string;
  title: string;
  coverArt: string;
  audioUrl: string;
  releaseDate: string;
}

export interface TestimonialType {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}