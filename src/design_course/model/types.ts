export interface FMSetlist {
  id: string;
  versionId: string;
  eventDate: string;
  lastUpdated: string;
  artist: FMCoverOrArtist;
  venue: FMVenue;
  tour: FMSongEntityOrTour;
  sets: FMSets;
  url: string;
}
export interface FMCoverOrArtist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation: string;
  url: string;
}
export interface FMVenue {
  id: string;
  name: string;
  city: FMCity;
  url: string;
}
export interface FMCity {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  coords: FMCoords;
  country: FMCountry;
}
export interface FMCoords {
  lat: number;
  long: number;
}
export interface FMCountry {
  code: string;
  name: string;
}
export interface FMSongEntityOrTour {
  name: string;
}
export interface FMSets {
  set?: FMSetEntity[] | null;
}
export interface FMSetEntity {
  song?: FMSongEntity[] | null;
  encore?: number | null;
}
export interface FMSongEntity {
  name: string;
  cover?: FMCoverOrArtist1 | null;
  encore?: boolean | null;
  spotifyData?: SpotifySong | null;
}
export interface FMCoverOrArtist1 {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation: string;
  url: string;
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  followers: SpotifyFollowers;
  genres?: string[] | null;
  href: string;
  id: string;
  images?: SpotifyImagesEntity[] | null;
  name: string;
  popularity: number;
  type: string;
  uri: string;
}
export interface SpotifyExternalUrls {
  spotify: string;
}
export interface SpotifyFollowers {
  href?: null;
  total: number;
}
export interface SpotifyImagesEntity {
  height: number;
  url: string;
  width: number;
}
export interface SpotifySong {
  albumImageUrl: string;
  albumName: string;
  duration: number;
  id: string;
}
