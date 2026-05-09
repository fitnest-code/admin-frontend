"use client";

import { useState } from "react";
import { Trash2, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore, LocalAdmin } from "@/lib/store/gym-store";
import { useCreateGymStep7 } from "@/lib/query/gym-query";
import { toast } from "sonner";

const ROLE_STYLES = {
  "Super admin": "bg-[#00B4CC] text-white",
};

const EMPTY_FORM: LocalAdmin = { firstName: "", lastName: "", phone: "", email: "", password: "" };

export function AdminsTab() {
  const { gymId, step7Admins: admins, addStep7Admin, removeStep7Admin } = useGymStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<LocalAdmin>(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);

  const { mutate: createStep7, isPending: isCompleting } = useCreateGymStep7();

  function handleAddAdmin() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      return toast.error("Zəhmət olmasa bütün xanaları doldurun");
    }
    addStep7Admin({ ...form });
    setForm(EMPTY_FORM);
    setModalOpen(false);
  }

  function handleSave() {
    if (!gymId) return toast.error("Zal ID tapılmadı");
    
    const payload = {
      admins: admins.map((a) => ({
        name: a.firstName,
        surname: a.lastName,
        phoneNumber: a.phone,
        email: a.email,
        password: a.password,
      })),
    };

    createStep7(
      { id: Number(gymId), payload },
      {
        onSuccess: () => {
          toast.success("Admin məlumatları uğurla yeniləndi");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Xəta baş verdi");
        },
      }
    );
  }

  function update(field: keyof LocalAdmin, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-sm font-bold text-foreground">Zalı idarə edən admin</h3>

        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="grid grid-cols-[140px_100px_1.5fr_1.2fr_1.5fr_40px] gap-3 border-b border-border bg-[#00B4CC14] px-4 py-3">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Rol</span>
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">ID</span>
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Ad / Soyad</span>
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Telefon</span>
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">E-poçt</span>
            <span />
          </div>

          {admins.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground bg-secondary/10">
              Admin əlavə edilməyib
            </div>
          ) : (
            admins.map((admin, index) => (
              <div key={index} className="grid grid-cols-[140px_100px_1.5fr_1.2fr_1.5fr_40px] items-center gap-3 border-b border-border px-4 py-3.5 last:border-0 hover:bg-secondary/20 transition-colors">
                <div>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight", ROLE_STYLES["Super admin"])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    Super admin
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">#00127</span>
                <span className="text-sm font-medium text-foreground">{admin.firstName} {admin.lastName}</span>
                <span className="text-sm text-muted-foreground">{admin.phone || "+994 00 000 00 00"}</span>
                <span className="text-sm text-muted-foreground">{admin.email}</span>
                <button onClick={() => removeStep7Admin(index)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#00B4CC] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#008799] transition-all shadow-lg shadow-[#00B4CC20]">
            Admin əlavə et
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-base font-bold leading-none">+</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={handleSave} disabled={isCompleting} className="px-10 py-3.5 rounded-xl bg-muted text-muted-foreground font-bold transition-all hover:bg-secondary/50 flex items-center gap-2">
          {isCompleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Yadda saxla
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Admin əlavə et</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
            </div>
            <ModalField label="Ad" value={form.firstName} onChange={(v) => update("firstName", v)} placeholder="Adminin adı" />
            <ModalField label="Soyad" value={form.lastName} onChange={(v) => update("lastName", v)} placeholder="Adminin soyadı" />
            <ModalField label="Telefon" value={form.phone} onChange={(v) => update("phone", v)} placeholder="0501234567" />
            <ModalField label="Email" value={form.email} onChange={(v) => update("email", v)} placeholder="Adminin emaili" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Şifrə</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="············" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#00B4CC] transition-colors" />
                <button type="button" onClick={() => setShowPwd((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button onClick={handleAddAdmin} className="mt-1 w-full rounded-lg bg-[#00B4CC] py-2.5 text-sm font-semibold text-white hover:bg-[#008799] transition-colors">Yadda saxla</button>
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
