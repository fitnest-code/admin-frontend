import { create } from 'zustand'

export interface GymStep1Data {
  categoryId: number | null
  name: string
  dailyPrice: string
  contractPrice: string
  description: string
  phone: string
  email: string
}

interface GymStore {
  step1: GymStep1Data
  gymId: string | null
  setStep1: (data: Partial<GymStep1Data>) => void
  setGymId: (id: string) => void
}

export const useGymStore = create<GymStore>((set) => ({
  gymId: null,
  step1: {
    categoryId: null,
    name: '',
    dailyPrice: '',
    contractPrice: '',
    description: '',
    phone: '',
    email: '',
  },
  setStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
  setGymId: (id) => set({ gymId: id }),
}))