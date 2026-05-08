import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface GymState {
  gymId: number | null;
  setGymId: (id: number) => void;
  resetGym: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymId: null, 
      setGymId: (id) => set({ gymId: id }),
      resetGym: () => {
        set({ gymId: null });
        // Ehtiyat variant kimi localStorage-ı manual da silə bilərik
        localStorage.removeItem('gym-storage');
      },
    }),
    {
      name: 'gym-storage',
      // Əgər sessionStorage etsən, tab bağlanan kimi 67 ID-si silinəcək
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
)