"use client";

import { useState, useRef, useEffect } from "react";
import { X, Eye, EyeOff, Loader2, Plus, UserCheck, ShieldCheck, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore, LocalAdmin } from "@/lib/store/gym-store";
import { useValidateGymStep7, useCreateGymComplete } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SuccessAnimationModal } from "../../ui/success-animation-modal";
import Image from "next/image";

import { useT } from "@/lib/i18n";

const EMPTY_FORM: LocalAdmin = { firstName: "", lastName: "", phone: "", email: "", password: "", role: "Super admin" };

export function StepAdmins({ onComplete }: { onComplete?: () => void }) {
  const t = useT();
  const router = useRouter();
  const { 
    step1Data, step2Trainers, step3Data, step4Data, step5Photos, step6Data, 
    step7Admins: admins, addStep7Admin, removeStep7Admin, updateStep7Admin, resetGym 
  } = useGymStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<LocalAdmin>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);

  const validateStep7 = useValidateGymStep7();
  const createComplete = useCreateGymComplete();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIdx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAddAdmin() {
    const errors: Record<string, string> = {};
    if (!form.firstName.trim()) errors.firstName = t.validation.nameRequired;
    else if (form.firstName.length < 2 || form.firstName.length > 50) errors.firstName = t.validation.nameLength;

    if (!form.lastName.trim()) errors.lastName = t.validation.surnameRequired;
    else if (form.lastName.length < 2 || form.lastName.length > 50) errors.lastName = t.validation.surnameLength;

    if (!form.email.trim()) {
      errors.email = t.validation.emailRequired;
    } else {
      const isDuplicateEmail = admins.some((a, i) => i !== editingIndex && a.email && a.email.toLowerCase() === form.email.trim().toLowerCase());
      if (isDuplicateEmail) errors.email = t.admin.duplicateEmail;
    }

    if (!form.phone.trim()) errors.phone = t.validation.phoneRequired;
    else if (!/^(\+994|0)?\s?(10|50|51|55|60|70|77|99)(\s?\d){7}$/.test(form.phone)) errors.phone = t.validation.phoneInvalid;

    if (editingIndex === null) {
      if (!form.password) errors.password = t.validation.passwordRequired;
      else if (form.password.length < 8) errors.password = t.validation.passwordMinLength;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const emailVal = form.email.trim();

    if (editingIndex !== null) {
      updateStep7Admin(editingIndex, { ...form, email: emailVal });
    } else {
      addStep7Admin({ ...form, email: emailVal });
    }
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(false);
    setEditingIndex(null);
  }

  async function handleComplete() {
    if (admins.length === 0) return toast.error(t.admin.atLeastOneAdmin);

    try {
      const step7Payload = {
        admins: admins.map((a) => ({
          name: a.firstName,
          surname: a.lastName,
          phoneNumber: a.phone,
          email: a.email.trim() === "" ? null : a.email.trim(),
          password: a.password,
          role: a.role || "Admin",
        }) as any),
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
      toast.error(err?.response?.data?.message || err?.message || t.error.createFailed);
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
        <h2 className="text-[18px] font-semibold leading-[28px]">{t.admin.title}</h2>
        <button
          onClick={() => {
            setEditingIndex(null);
            setForm({ ...EMPTY_FORM, role: admins.length === 0 ? "Super admin" : "Admin" });
            setModalOpen(true);
          }}
          className="h-[40px] px-5 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2 text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
        >
          <span>{t.admin.addAdmin}</span>
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Admins Table */}
      <div className="flex flex-col w-full overflow-hidden border border-[#ececed] rounded-[12px] shadow-sm bg-white">
        {/* Table Head */}
        <div className="grid grid-cols-[142px_80px_1fr_131px_1fr_60px] items-center bg-[#00B4CC26] border-b border-[#CECFD2] px-6 py-3 gap-4">
          <div className="text-[14px] leading-[20px] font-bold">{t.common.role}</div>
          <div className="text-[14px] leading-[20px] font-bold">{t.common.id}</div>
          <div className="text-[14px] leading-[20px] font-bold">{t.common.name} / {t.common.surname}</div>
          <div className="text-[14px] leading-[20px] font-bold">{t.common.phone}</div>
          <div className="text-[14px] leading-[20px] font-bold">{t.common.email}</div>
          <div className="text-[14px] leading-[20px] font-bold text-center">{t.common.more}</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-black/40 italic">
               {t.admin.noAdmins}
            </div>
          ) : (
            admins.map((admin, idx) => (
              <div key={idx} className="grid grid-cols-[142px_80px_1fr_131px_1fr_60px] items-center px-6 py-2.5 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors gap-4">
                {/* Rol */}
                 <div>
                    <div className="inline-flex items-center gap-2 bg-[#00B4CC] rounded-[4px] px-2 py-0.5 text-white">
                       {admin.role === "Super admin" ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
                       <span className="text-[13px] font-medium leading-5">
                          {admin.role === "Super admin" ? t.admin.superAdmin : t.admin.adminRole}
                       </span>
                    </div>
                 </div>

                 {/* ID */}
                 <div className="text-[13px] leading-5 text-black">000000</div>

                 {/* Ad / Soyad */}
                 <div className="text-[13px] leading-5 font-normal text-black truncate">
                   {admin.firstName} {admin.lastName}
                 </div>

                 {/* Telefon */}
                 <div className="text-[13px] leading-5 text-black">
                   {admin.phone || "+994 00 000 00 00"}
                 </div>

                 {/* E-poçt */}
                 <div className="text-[13px] leading-5 text-black truncate">
                   {admin.email}
                 </div>

                {/* Actions */}
                <div className="flex items-center justify-center relative">
                   <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
                     }}
                     className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-70"
                   >
                      <Image src="/more.png" width={20} height={20} alt="More" />
                   </button>
                   {openDropdownIdx === idx && (
                      <div ref={dropdownRef} className="absolute right-0 top-10 w-[140px] bg-white rounded-lg shadow-xl border border-[#ececed] py-1 z-[10]">
                         <button onClick={() => { setEditingIndex(idx); setForm(admin); setFormErrors({}); setModalOpen(true); setOpenDropdownIdx(null); }} className="w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-slate-50 flex items-center gap-2">
                           <Edit size={16} className="text-[#6a7282]" />
                           {t.common.edit}
                         </button>
                         <button onClick={() => { removeStep7Admin(idx); setOpenDropdownIdx(null); }} className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                           <Trash size={16} />
                           {t.common.delete}
                         </button>
                      </div>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            const { resetStep7Admins } = useGymStore.getState();
            resetStep7Admins();
          }}
          className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
        >
          {t.common.reset}
        </button>
        <button
          onClick={handleComplete}
          disabled={isCompleting || admins.length === 0}
          className="h-[40px] w-[240px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
        >
          {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.gyms.createGym}
        </button>
      </div>

      <SuccessAnimationModal 
        isOpen={showSuccess} 
        onClose={handleSuccessClose} 
      />

      {/* Add Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-[400px] rounded-[24px] bg-white border border-[#ececed] shadow-2xl overflow-hidden flex flex-col p-6 gap-5 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-[#101828]">{editingIndex !== null ? t.admin.editAdmin : t.admin.addAdmin}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-[#6a7282]" /></button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.name}</label>
                <input value={form.firstName} onChange={(e) => {setForm({...form, firstName: e.target.value}); setFormErrors({...formErrors, firstName: ""});}} placeholder={t.placeholder.adminName} className={cn("w-full h-[40px] rounded-lg bg-[#fafafa] border px-4 text-[14px] outline-none transition-all font-medium", formErrors.firstName ? "border-red-500 focus:border-red-500" : "border-[#ececed] focus:border-[#00B4CC]")} />
                {formErrors.firstName && <span className="text-[12px] text-red-500">{formErrors.firstName}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.surname}</label>
                <input value={form.lastName} onChange={(e) => {setForm({...form, lastName: e.target.value}); setFormErrors({...formErrors, lastName: ""});}} placeholder={t.placeholder.adminSurname} className={cn("w-full h-[40px] rounded-lg bg-[#fafafa] border px-4 text-[14px] outline-none transition-all font-medium", formErrors.lastName ? "border-red-500 focus:border-red-500" : "border-[#ececed] focus:border-[#00B4CC]")} />
                {formErrors.lastName && <span className="text-[12px] text-red-500">{formErrors.lastName}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.phone}</label>
                <input value={form.phone} onChange={(e) => {setForm({...form, phone: e.target.value}); setFormErrors({...formErrors, phone: ""});}} placeholder={t.placeholder.phone} className={cn("w-full h-[40px] rounded-lg bg-[#fafafa] border px-4 text-[14px] outline-none transition-all font-medium", formErrors.phone ? "border-red-500 focus:border-red-500" : "border-[#ececed] focus:border-[#00B4CC]")} />
                {formErrors.phone && <span className="text-[12px] text-red-500">{formErrors.phone}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.email}</label>
                <input value={form.email} onChange={(e) => {setForm({...form, email: e.target.value}); setFormErrors({...formErrors, email: ""});}} placeholder={t.placeholder.email} className={cn("w-full h-[40px] rounded-lg bg-[#fafafa] border px-4 text-[14px] outline-none transition-all font-medium", formErrors.email ? "border-red-500 focus:border-red-500" : "border-[#ececed] focus:border-[#00B4CC]")} />
                {formErrors.email && <span className="text-[12px] text-red-500">{formErrors.email}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.role}</label>
                <select value={form.role || "Admin"} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full h-[40px] rounded-lg bg-[#fafafa] border border-[#ececed] px-4 text-[14px] outline-none focus:border-[#00B4CC] transition-all font-medium">
                  <option value="Super admin">{t.admin.superAdmin}</option>
                  <option value="Admin">{t.admin.adminRole}</option>
                </select>
              </div>
              {editingIndex === null && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-black/60">{t.common.password}</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => {setForm({...form, password: e.target.value}); setFormErrors({...formErrors, password: ""});}} placeholder={t.placeholder.password} className={cn("w-full h-[40px] rounded-lg bg-[#fafafa] border px-4 pr-10 text-[14px] outline-none transition-all font-medium", formErrors.password ? "border-red-500 focus:border-red-500" : "border-[#ececed] focus:border-[#00B4CC]")} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a7282] hover:text-black transition-colors">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {formErrors.password && <span className="text-[12px] text-red-500">{formErrors.password}</span>}
              </div>
              )}
            </div>

            <button onClick={handleAddAdmin} className="w-full h-[40px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:bg-[#009DB3] transition-all mt-1 shadow-md shadow-cyan-50">{t.common.save}</button>
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
