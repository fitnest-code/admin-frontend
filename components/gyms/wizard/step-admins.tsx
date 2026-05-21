"use client";

import { useState } from "react";
import { Trash2, X, Eye, EyeOff, Loader2, Plus, UserCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore, LocalAdmin } from "@/lib/store/gym-store";
import { useValidateGymStep7, useCreateGymComplete } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SuccessAnimationModal } from "../../ui/success-animation-modal";
import Image from "next/image";

const EMPTY_FORM: LocalAdmin = { firstName: "", lastName: "", phone: "", email: "", password: "" };

export function StepAdmins({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const { 
    step1Data, step2Trainers, step3Data, step4Data, step5Photos, step6Data, 
    step7Admins: admins, addStep7Admin, removeStep7Admin, resetGym 
  } = useGymStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<LocalAdmin>(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);

  const validateStep7 = useValidateGymStep7();
  const createComplete = useCreateGymComplete();

  function handleAddAdmin() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return toast.error("Zəhmət olmasa bütün xanaları doldurun");
    }

    const isDuplicateEmail = admins.some(a => a.email.toLowerCase() === form.email.toLowerCase());
    if (isDuplicateEmail) return toast.error("Bu e-poçt ünvanı ilə admin artıq əlavə edilib");

    addStep7Admin({ ...form });
    setForm(EMPTY_FORM);
    setModalOpen(false);
  }

  async function handleComplete() {
    if (admins.length === 0) return toast.error("Ən azı bir admin əlavə edilməlidir");

    try {
      const step7Payload = {
        admins: admins.map((a) => ({
          name: a.firstName,
          surname: a.lastName,
          phoneNumber: a.phone,
          email: a.email,
          password: a.password,
        })),
      };

      // 1. Validate Step 7
      await validateStep7.mutateAsync(step7Payload);

      // 2. Final Sequential Creation
      await createComplete.mutateAsync({
        step1: step1Data!,
        step2: step2Trainers,
        step3: step3Data!,
        step4: step4Data!,
        step5: step5Photos!,
        step6: step6Data!,
        step7: step7Payload
      });

      setShowSuccess(true);
      resetGym();
      onComplete?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Yaradılma zamanı xəta baş verdi");
    }
  }

  const isCompleting = validateStep7.isPending || createComplete.isPending;

  function handleSuccessClose() {
    setShowSuccess(false);
    router.push("/gyms");
  }

  return (
    <div className="flex flex-col gap-9 font-sans text-black">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
        <h2 className="text-[20px] font-semibold leading-[30px]">Zalı idarə edən admin</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="h-12 px-6 bg-[#00B4CC] rounded-[12px] flex items-center justify-center gap-3 text-white text-[16px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <span>Admin əlavə et</span>
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* Admins Table */}
      <div className="flex flex-col w-full overflow-hidden border border-[#ececed] rounded-[12px] shadow-sm bg-white">
        {/* Table Head */}
        <div className="grid grid-cols-[142px_80px_1fr_131px_1fr_60px] items-center bg-[#00B4CC26] border-b border-[#CECFD2] px-6 py-5 gap-4">
          <div className="text-[16px] leading-[24px]">Rol</div>
          <div className="text-[16px] leading-[24px]">ID</div>
          <div className="text-[16px] leading-[24px]">Ad / Soyad</div>
          <div className="text-[16px] leading-[24px]">Telefon</div>
          <div className="text-[16px] leading-[24px]">E-poçt</div>
          <div /> {/* Empty header for delete column */}
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/40 italic">
               Admin əlavə edilməyib
            </div>
          ) : (
            admins.map((admin, idx) => (
              <div key={idx} className="grid grid-cols-[142px_80px_1fr_131px_1fr_60px] items-center px-6 py-4 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors gap-4">
                {/* Rol */}
                <div>
                   <div className="inline-flex items-center gap-2 bg-[#00B4CC] rounded-[4px] px-2 py-1 text-white">
                      {idx === 0 ? <ShieldCheck size={16} /> : <UserCheck size={16} />}
                      <span className="text-[14px] font-medium leading-6">
                        {idx === 0 ? "Super admin" : "Admin"}
                      </span>
                   </div>
                </div>

                {/* ID */}
                <div className="text-[14px] leading-5 text-black">000000</div>

                {/* Ad / Soyad */}
                <div className="text-[14px] leading-5 font-normal text-black truncate">
                  {admin.firstName} {admin.lastName}
                </div>

                {/* Telefon */}
                <div className="text-[14px] leading-5 text-black">
                  {admin.phone || "+994 00 000 00 00"}
                </div>

                {/* E-poçt */}
                <div className="text-[14px] leading-5 text-black truncate">
                  {admin.email}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center">
                   <button 
                     onClick={() => removeStep7Admin(idx)}
                     className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70"
                   >
                      <Image src="/trash.png" width={20} height={20} alt="Delete" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={handleComplete}
          disabled={isCompleting || admins.length === 0}
          className="h-[48px] w-[280px] rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
        >
          {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
          Yadda saxla və bitir
        </button>
      </div>

      <SuccessAnimationModal 
        isOpen={showSuccess} 
        onClose={handleSuccessClose} 
      />

      {/* Add Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-[440px] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-hidden flex flex-col p-8 gap-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#101828]">Admin əlavə et</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-[#6a7282]" /></button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold">Ad</label>
                <input value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} placeholder="Adminin adı" className="w-full h-[52px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[16px] outline-none focus:border-[#00B4CC] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold">Soyad</label>
                <input value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} placeholder="Adminin soyadı" className="w-full h-[52px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[16px] outline-none focus:border-[#00B4CC] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold">Telefon</label>
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+994 50 000 00 00" className="w-full h-[52px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[16px] outline-none focus:border-[#00B4CC] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold">E-poçt</label>
                <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="admin@fitnest.az" className="w-full h-[52px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 text-[16px] outline-none focus:border-[#00B4CC] transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold">Şifrə</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="········" className="w-full h-[52px] rounded-xl bg-[#fafafa] border border-[#ececed] px-4 pr-12 text-[16px] outline-none focus:border-[#00B4CC] transition-all" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6a7282] hover:text-black transition-colors">{showPwd ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>
            </div>

            <button onClick={handleAddAdmin} className="w-full h-12 rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:bg-[#009DB3] transition-all mt-2">Yadda saxla</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#00B4CC] transition-colors" />
    </div>
  );
}
