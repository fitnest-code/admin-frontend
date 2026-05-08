import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface LocalTrainer {
  name: string;
  surname: string;
  professionId: string;
  professionName?: string;
  phone: string;
  email: string;
  photo: File;
  preview: string;
}

interface GymState {
  gymId: number | null;
  step2Trainers: LocalTrainer[];
  setGymId: (id: number) => void;
  addStep2Trainer: (trainer: LocalTrainer) => void;
  removeStep2Trainer: (index: number) => void;
  resetGym: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymId: null, 
      step2Trainers: [],
      setGymId: (id) => set({ gymId: id }),
      addStep2Trainer: (trainer) => set((state) => ({ 
        step2Trainers: [...state.step2Trainers, trainer] 
      })),
      removeStep2Trainer: (index) => set((state) => ({
        step2Trainers: state.step2Trainers.filter((_, i) => i !== index)
      })),
      resetGym: () => {
        set({ gymId: null, step2Trainers: [] });
        sessionStorage.removeItem('gym-storage');
      },
    }),
    {
      name: 'gym-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ gymId: state.gymId }),
    }
  )
)