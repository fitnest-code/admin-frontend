import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface LocalTrainer {
  name: string;
  surname: string;
  professionId: string;
  professionName?: string;
  phone: string;
  email: string;
  photo?: File;
  preview: string;
  lessonTypeIds?: number[];
}

export interface LocalAdmin {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

export interface Step1Data {
  categoryId: number;
  name: string;
  description: string;
  phone: string;
  email: string | null;
  lessonTypeIds: number[];
}

export interface Step3Data {
  generalWorkHours: any[];
  workHoursWoman: any[];
  workHoursMan: any[];
  restDays: any[];
}

export interface Step4Data {
  cityId: number | null;
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface Step6Data {
  subscriptions: any[];
}

interface GymState {
  gymId: number | null;
  currentTab: string | null;
  completedSteps: string[];
  step1Data: Step1Data | null;
  step2Trainers: LocalTrainer[];
  step3Data: Step3Data | null;
  step4Data: Step4Data | null;
  step5Photos: { cover: File | null; rooms: { name: string; file: File }[] } | null;
  step6Data: Step6Data | null;
  step7Admins: LocalAdmin[];

  setGymId: (id: number) => void;
  setCurrentTab: (tab: string) => void;
  markStepCompleted: (stepKey: string) => void;
  isStepAccessible: (stepKey: string, allStepKeys: string[]) => boolean;
  setStep1Data: (data: Step1Data) => void;
  setStep2Trainers: (trainers: LocalTrainer[]) => void;
  addStep2Trainer: (trainer: LocalTrainer) => void;
  removeStep2Trainer: (index: number) => void;
  updateStep2Trainer: (index: number, trainer: LocalTrainer) => void;
  setStep3Data: (data: Step3Data) => void;
  setStep4Data: (data: Step4Data) => void;
  setStep5Photos: (photos: { cover: File | null; rooms: { name: string; file: File }[] }) => void;
  setStep6Data: (data: Step6Data) => void;
  setStep7Admins: (admins: LocalAdmin[]) => void;
  addStep7Admin: (admin: LocalAdmin) => void;
  removeStep7Admin: (index: number) => void;
  resetGym: () => void;
  resetStep1Data: () => void;
  resetStep2Trainers: () => void;
  resetStep3Data: () => void;
  resetStep4Data: () => void;
  resetStep5Photos: () => void;
  resetStep6Data: () => void;
  resetStep7Admins: () => void;
}

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      gymId: null, 
      currentTab: null,
      completedSteps: [],
      step1Data: null,
      step2Trainers: [],
      step3Data: null,
      step4Data: null,
      step5Photos: null,
      step6Data: null,
      step7Admins: [],

      setGymId: (id) => set({ gymId: id }),
      setCurrentTab: (tab) => set({ currentTab: tab }),
      markStepCompleted: (stepKey) => set((state) => ({
        completedSteps: state.completedSteps.includes(stepKey)
          ? state.completedSteps
          : [...state.completedSteps, stepKey]
      })),
      isStepAccessible: (stepKey, allStepKeys) => {
        const state = get();
        const stepIndex = allStepKeys.indexOf(stepKey);
        if (stepIndex === 0) return true; // First step is always accessible
        // A step is accessible if the previous step has been completed
        const prevStep = allStepKeys[stepIndex - 1];
        return state.completedSteps.includes(prevStep);
      },
      setStep1Data: (data) => set({ step1Data: data }),
      setStep2Trainers: (trainers) => set({ step2Trainers: trainers }),
      addStep2Trainer: (trainer) => set((state) => ({ 
        step2Trainers: [...state.step2Trainers, trainer] 
      })),
      removeStep2Trainer: (index) => set((state) => ({
        step2Trainers: state.step2Trainers.filter((_, i) => i !== index)
      })),
      updateStep2Trainer: (index, trainer) => set((state) => ({
        step2Trainers: state.step2Trainers.map((t, i) => i === index ? trainer : t)
      })),
      setStep3Data: (data) => set({ step3Data: data }),
      setStep4Data: (data) => set({ step4Data: data }),
      setStep5Photos: (photos) => set({ step5Photos: photos }),
      setStep6Data: (data) => set({ step6Data: data }),
      setStep7Admins: (admins) => set({ step7Admins: admins }),
      addStep7Admin: (admin) => set((state) => ({ 
        step7Admins: [...state.step7Admins, admin] 
      })),
      removeStep7Admin: (index) => set((state) => ({
        step7Admins: state.step7Admins.filter((_, i) => i !== index)
      })),
      resetGym: () => {
        set({ 
          gymId: null, 
          currentTab: null,
          completedSteps: [],
          step1Data: null,
          step2Trainers: [], 
          step3Data: null,
          step4Data: null,
          step5Photos: null,
          step6Data: null,
          step7Admins: [] 
        });
        localStorage.removeItem('gym-storage');
      },
      resetStep1Data: () => set({ step1Data: null }),
      resetStep2Trainers: () => set({ step2Trainers: [] }),
      resetStep3Data: () => set({ step3Data: null }),
      resetStep4Data: () => set({ step4Data: null }),
      resetStep5Photos: () => set({ step5Photos: null }),
      resetStep6Data: () => set({ step6Data: null }),
      resetStep7Admins: () => set({ step7Admins: [] }),
    }),
    {
      name: 'gym-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        gymId: state.gymId,
        currentTab: state.currentTab,
        completedSteps: state.completedSteps,
        step1Data: state.step1Data,
        step2Trainers: state.step2Trainers.map(t => ({ ...t, photo: undefined })), // Don't persist File
        step3Data: state.step3Data,
        step4Data: state.step4Data,
        step6Data: state.step6Data,
        step7Admins: state.step7Admins
      }),
    }
  )
)