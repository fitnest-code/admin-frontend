// İş saatları üçün ortaq struktur
export interface IWorkHour {
  period: string; // Məsələn: "Monday-Wednesday" və ya "Friday"
  from: string;   // "09:00"
  to: string;     // "21:00"
}

// İstirahət günləri üçün struktur
export interface IRestDay {
  period: string; // "Sunday"
}

// Step 3 üçün əsas Payload
export interface IGymWorkHoursPayload {
  gymId: number; // Sorğunu göndərəndə URL üçün lazım olacaq
  generalWorkHours: IWorkHour[];
  workHoursWoman: IWorkHour[];
  workHoursMan: IWorkHour[];
  restDays: IRestDay[];
}

export interface IWorkHoursResponse {
  id: number;
  success?: boolean;
}