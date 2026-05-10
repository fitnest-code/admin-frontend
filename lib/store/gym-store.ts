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

export interface LocalAdmin {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

interface GymState {
  gymId: number | null;
  currentTab: string | null;
  step2Trainers: LocalTrainer[];
  step7Admins: LocalAdmin[];
  setGymId: (id: number) => void;
  setCurrentTab: (tab: string) => void;
  addStep2Trainer: (trainer: LocalTrainer) => void;
  removeStep2Trainer: (index: number) => void;
  updateStep2Trainer: (index: number, trainer: LocalTrainer) => void;
  addStep7Admin: (admin: LocalAdmin) => void;
  removeStep7Admin: (index: number) => void;
  resetGym: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      gymId: null, 
      currentTab: null,
      step2Trainers: [],
      step7Admins: [],
      setGymId: (id) => set({ gymId: id }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      addStep2Trainer: (trainer) => set((state) => ({ 
        step2Trainers: [...state.step2Trainers, trainer] 
      })),
      removeStep2Trainer: (index) => set((state) => ({
        step2Trainers: state.step2Trainers.filter((_, i) => i !== index)
      })),
      updateStep2Trainer: (index, trainer) => set((state) => ({
        step2Trainers: state.step2Trainers.map((t, i) => i === index ? trainer : t)
      })),
      addStep7Admin: (admin) => set((state) => ({ 
        step7Admins: [...state.step7Admins, admin] 
      })),
      removeStep7Admin: (index) => set((state) => ({
        step7Admins: state.step7Admins.filter((_, i) => i !== index)
      })),
      resetGym: () => {
        set({ gymId: null, currentTab: null, step2Trainers: [], step7Admins: [] });
        sessionStorage.removeItem('gym-storage');
      },
    }),
    {
      name: 'gym-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        gymId: state.gymId,
        currentTab: state.currentTab,
        step2Trainers: state.step2Trainers,
        step7Admins: state.step7Admins
      }),
    }
  )
)