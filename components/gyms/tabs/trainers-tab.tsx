import { Plus, Search, MoreVertical, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { useState } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainersQuery } from "@/lib/query/trainers";
import { useAddTrainer } from "@/lib/query/add-trainer-query";
import { toast } from "sonner";

export function TrainersTab({ isNew, onNext }: { isNew?: boolean, onNext?: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

  const { gymId, step2Trainers, removeStep2Trainer } = useGymStore();
  const { mutate, isPending: isSaving } = useAddTrainer();

  const { data: apiData, isLoading: apiLoading } = useGymTrainersQuery(
    Number(gymId) || 0,
    page,
    pageSize,
    sortDir,
    { enabled: !isNew && !!gymId }
  );

  const apiTrainers = apiData?.items ?? [];
  
  const source = [
    ...apiTrainers, 
    ...step2Trainers.map((t, idx) => ({
      trainer_id: `local-${idx}`,
      name: t.name,
      surname: t.surname,
      profession: { id: Number(t.professionId), name: t.professionName || "" },
      picture: t.preview,
      phone: t.phone,
      email: t.email,
      isLocal: true,
      localIndex: idx
    }))
  ];

  const handleNext = () => {
    if (step2Trainers.length === 0) {
      onNext?.();
      return;
    }

    if (!gymId) {
      toast.error("Zal ID tapılmadı");
      return;
    }

    mutate(
      {
        id: Number(gymId),
        names: step2Trainers.map((t) => t.name),
        surnames: step2Trainers.map((t) => t.surname),
        professionIds: step2Trainers.map((t) => Number(t.professionId)),
        emails: step2Trainers.map((t) => t.email),
        phones: step2Trainers.map((t) => t.phone),
        photos: step2Trainers.map((t) => t.photo),
      },
      {
        onSuccess: () => {
          toast.success("Məşqçilər uğurla yadda saxlanıldı");
          useGymStore.setState({ step2Trainers: [] });
          onNext?.();
        },
        onError: (err: any) => toast.error(err.message || "Xəta baş verdi"),
      }
    );
  };

  if (!gymId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <AlertCircle className="h-12 w-12 text-orange-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Zal yaradılmayıb</h3>
        <p className="text-slate-500 max-w-sm text-center mt-2">
          Məşqçi əlavə etmək üçün əvvəlcə "Zal məlumatları" bölməsində zalı yaradın.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Məşqçi axtar..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:border-[#00B4CC]" />
        </div>

        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-[#00B4CC] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#009DB3] transition-colors">
          Məşqçi əlavə et <Plus size={18} />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ad / Soyad</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Telefon</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">E-poçt</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {apiLoading ? (
              <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin inline text-[#00B4CC]" /></td></tr>
            ) : source.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">Hələ ki məşqçi əlavə edilməyib</td></tr>
            ) : (
              source.map((t: any) => (
                <tr key={t.trainer_id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={t.picture || "/default-avatar.png"} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{t.name} {t.surname}</p>
                        {t.isLocal && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Yeni</span>}
                      </div>
                      <p className="text-xs text-[#00B4CC]">{t.profession?.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.email}</td>
                  <td className="px-6 py-4 text-right">
                    {t.isLocal ? (
                      <button onClick={() => removeStep2Trainer(t.localIndex)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6">
        <button 
          onClick={handleNext} 
          disabled={isSaving}
          className="px-10 py-3 rounded-xl font-bold bg-[#00B4CC] text-white hover:bg-[#009DB3] disabled:bg-slate-200 flex items-center gap-2 shadow-lg shadow-[#00B4CC20] transition-all"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Növbəti
        </button>
      </div>

      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}