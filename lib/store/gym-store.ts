import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GymState {
  gymId: number | null;
  setGymId: (id: number) => void;
  resetGym: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymId: null, // Başlanğıcda null olması normaldır
      setGymId: (id) => set({ gymId: id }),
      resetGym: () => set({ gymId: null }),
    }),
    {
      name: 'gym-storage', // Brauzerin yaddaşında bu adla saxlanacaq
    }
  )
)