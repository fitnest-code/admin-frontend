// 1. Koordinat məlumatları üçün baza interfeys
export interface ICoordinates {
  latitude: number;
  longitude: number;
}


export interface IReverseGeocodingResponse {
  addressText: string;
  city: string;
}


export interface IGymStep4Payload {
  gymId: number;
  latitude: number;
  longitude: number;
 
}

// 4. Komponent daxilində istifadə edəcəyimiz state forması
export interface IAddressState extends ICoordinates {
  addressName: string;
  isMapLoaded: boolean;
}