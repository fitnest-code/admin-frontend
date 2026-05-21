import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../api/client";
import { IGymStep4Payload, IReverseGeocodingResponse } from "../types/address-step";


// 1. Reverse Geocoding (Koordinatdan ünvan almaq)
export const useGetAddressByCoords = (lat: number, lng: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["reverse-geocoding", lat, lng],
    queryFn: () => 
      apiGet<IReverseGeocodingResponse>("/admin/gyms/geocoding/reverse", {
        params: { lat, lng }
      }),
    enabled: enabled && !!lat && !!lng,
    staleTime: 1000 * 60 * 5,
  });
};

// 2. Step 4 Submit (Məkan məlumatlarını göndərmək)
export const useAddGymLocation = () => {
  return useMutation({
    mutationFn: (payload: IGymStep4Payload) => 
      apiPost(`/admin/gyms/${payload.gymId}/step4`, {
        latitude: payload.latitude,
        longitude: payload.longitude,
      })
  });
};

// 3. Forward Geocoding (Mətn axtarışı)
export const useForwardGeocode = (query: string) => {
  return useQuery({
    queryKey: ["forward-geocoding", query],
    queryFn: () => 
      apiGet<IReverseGeocodingResponse[]>("/admin/gyms/geocoding/forward", {
        params: { query }
      }),
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
};