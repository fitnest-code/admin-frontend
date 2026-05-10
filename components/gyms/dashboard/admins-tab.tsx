"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Trash2, Loader2, Plus, UserPlus, Shield, User, Key, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymAdmins, useAddGymAdmin, useDeleteGymAdmin } from "@/lib/query/gym-query";
import { toast } from "sonner";

export function AdminsTab() {
  const { gymId } = useGymStore();
  const { data: admins, isLoading } = useGymAdmins(gymId);
  const { mutate: addAdmin, isPending: isAdding } = useAddGymAdmin();
  const { mutate: deleteAdmin } = useDeleteGymAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    
    if (!form.name || !form.surname || !form.email || !form.password) {
      return toast.error("Zəhmət olmasa bütün vacib xanaları doldurun");
    }

    addAdmin(
      { gymId: Number(gymId), payload: form },
      {
        onSuccess: () => {
          setModalOpen(false);
          setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "" });
        }
      }
    );
  };

  const handleDelete = (adminId: number) => {
    if (!gymId || !confirm("Bu admini silmək istədiyinizə əminsiniz?")) return;
    deleteAdmin({ gymId: Number(gymId), adminId });
  };

  if (isLoading) {
    return (
      <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="font-medium font-sans">Adminlər yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-2 font-sans">
      <div className="w-full bg-white rounded-2xl border border-[#ececed] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-[#ececed] flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[18px] font-bold text-[#101828]">Zalı idarə edən adminlər</h3>
            <p className="text-[14px] text-slate-500">Zalın idarə edilməsi üçün təyin olunmuş məsul şəxslər</p>
          </div>
          
          <button 
            onClick={() => setModalOpen(true)}
            className="h-11 px-5 bg-[#00B4CC] text-white rounded-xl flex items-center gap-2.5 font-semibold text-[14px] hover:bg-[#009DB3] transition-all shadow-sm"
          >
            <UserPlus size={18} />
            Admin əlavə et
          </button>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <div className="overflow-hidden border border-[#cecfd2] rounded-xl shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[160px_100px_1fr_1.2fr_1.5fr_60px] gap-4 bg-[#00B4CC]/10 px-5 py-4 border-b border-[#cecfd2]">
              <div className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">Rol</div>
              <div className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">ID</div>
              <div className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">Ad / Soyad</div>
              <div className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">Telefon</div>
              <div className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">E-poçt</div>
              <div className="text-center text-[12px] font-bold text-[#101828] uppercase tracking-wider">Əməl</div>
            </div>

            {/* Table Body */}
            {admins?.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                Siyahı boşdur
              </div>
            ) : (
              admins?.map((admin: any) => (
                <div key={admin.id} className="grid grid-cols-[160px_100px_1fr_1.2fr_1.5fr_60px] gap-4 px-5 py-4 items-center border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center justify-center bg-[#00B4CC] border border-[#ececed] rounded-[4px] px-2 py-1 gap-2 text-white font-['SF_Pro',sans-serif] text-[16px]">
                      {admin.role === "Super admin" ? (
                        <>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Image src="/superAdmin.svg" width={20} height={20} alt="Super" />
                          </div>
                          <span className="font-medium leading-6">Super admin</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <Image src="/admin.svg" width={20} height={20} alt="Admin" />
                          </div>
                          <span className="font-medium leading-6">Admin</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-[14px] text-slate-600 font-mono">#{String(admin.id).padStart(6, '0')}</div>
                  <div className="text-[14px] font-bold text-[#101828] truncate">{admin.name} {admin.surname}</div>
                  <div className="text-[14px] text-slate-600 truncate">{admin.phone || "—"}</div>
                  <div className="text-[14px] text-slate-600 truncate">{admin.email}</div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleDelete(admin.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-[500px] bg-white rounded-3xl border border-[#ececed] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-[#ececed] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00B4CC]/10 flex items-center justify-center text-[#00B4CC]">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-[20px] font-bold text-[#101828]">Admin əlavə et</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-[#101828]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-8 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-[#344054]">Ad</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full h-12 pl-10 pr-4 bg-[#fafafa] border border-[#ececed] rounded-xl outline-none focus:border-[#00B4CC] transition-all text-[15px]"
                      placeholder="Məs: Kamal"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-[#344054]">Soyad</label>
                  <input 
                    type="text"
                    required
                    value={form.surname}
                    onChange={e => setForm({...form, surname: e.target.value})}
                    className="w-full h-12 px-4 bg-[#fafafa] border border-[#ececed] rounded-xl outline-none focus:border-[#00B4CC] transition-all text-[15px]"
                    placeholder="Məs: Aliyev"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-[#344054]">E-poçt</label>
                <input 
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full h-12 px-4 bg-[#fafafa] border border-[#ececed] rounded-xl outline-none focus:border-[#00B4CC] transition-all text-[15px]"
                  placeholder="admin@mail.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-[#344054]">Telefon nömrəsi</label>
                <input 
                  type="text"
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber: e.target.value})}
                  className="w-full h-12 px-4 bg-[#fafafa] border border-[#ececed] rounded-xl outline-none focus:border-[#00B4CC] transition-all text-[15px]"
                  placeholder="+994 00 000 00 00"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-[#344054]">Şifrə</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full h-12 pl-10 pr-12 bg-[#fafafa] border border-[#ececed] rounded-xl outline-none focus:border-[#00B4CC] transition-all text-[15px]"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00B4CC] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[12px] text-slate-400 italic">Admin bu şifrə ilə sistemə daxil olacaq</p>
              </div>

              <button 
                type="submit"
                disabled={isAdding}
                className="w-full h-12 mt-2 bg-[#00B4CC] text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#009DB3] transition-all disabled:bg-slate-200"
              >
                {isAdding ? <Loader2 size={20} className="animate-spin" /> : "Admini yarat"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
