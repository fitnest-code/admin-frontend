"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2, UserPlus, User, Key, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymAdmins, useAddGymAdmin, useDeleteGymAdmin } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";

export function AdminsTab() {
  const { gymId } = useGymStore();
  const { data: admins, isLoading } = useGymAdmins(gymId);
  const { mutate: addAdmin, isPending: isAdding } = useAddGymAdmin();
  const { mutate: deleteAdmin } = useDeleteGymAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
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
          toast.success("Admin uğurla əlavə edildi");
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Xəta baş verdi");
        }
      }
    );
  };

  const handleDelete = () => {
    if (!gymId || !deleteAdminId) return;
    deleteAdmin({ gymId: Number(gymId), adminId: deleteAdminId }, {
      onSuccess: () => {
        setDeleteAdminId(null);
        toast.success("Admin silindi");
      }
    });
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
    <div className="flex flex-col gap-6 py-2 font-sans text-black">
      {/* Main Container */}
      <div className="w-full bg-white rounded-[12px] border border-[#ececed] flex flex-col items-start p-5 gap-7">
        
        {/* Title Section */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-1">
          <h2 className="text-[20px] font-semibold leading-[30px] text-black">Zalı idarə edən admin</h2>
        </div>

        {/* Table Section */}
        <div className="w-full flex flex-col items-start">
          {/* Table Header */}
          <div className="w-full flex items-center bg-[#00b4cc]/15 border border-[#cecfd2] rounded-t-[12px] px-[10px] py-5 gap-[68px]">
            <div className="w-[142px] text-[16px] leading-[24px] font-normal text-black">Rol</div>
            <div className="w-[61px] text-[16px] leading-[24px] font-normal text-black">ID</div>
            <div className="w-[111px] text-[16px] leading-[24px] font-normal text-black">Ad / Soyad</div>
            <div className="w-[150px] text-[16px] leading-[24px] font-normal text-black">Telefon</div>
            <div className="w-[130px] text-[16px] leading-[24px] font-normal text-black">E-poçt</div>
          </div>

          {/* Table Body */}
          <div className="w-full flex flex-col">
            {admins?.length === 0 ? (
              <div className="w-full bg-white border-x border-b border-[#ececed] p-10 text-center text-slate-400">
                Admin tapılmadı
              </div>
            ) : (
              admins?.map((admin: any) => (
                <div key={admin.id} className="w-full flex items-center bg-white border-x border-b border-[#ececed] px-[10px] py-5 gap-[68px] hover:bg-slate-50 transition-colors">
                  {/* Role Badge */}
                  <div className="w-[142px] flex items-center justify-center bg-[#00b4cc] border border-[#ececed] rounded-[4px] px-2 py-1 gap-2 text-white">
                    <div className="w-5 h-5 relative">
                      <Image 
                        src={admin.role === "Super admin" ? "/superAdmin.svg" : "/admin.svg"} 
                        fill 
                        alt="Role" 
                        className={cn("object-contain", admin.role === "Super admin" ? "p-[2px]" : "p-[1px]")}
                      />
                    </div>
                    <span className="text-[16px] font-medium leading-[24px]">{admin.role}</span>
                  </div>

                  {/* ID */}
                  <div className="w-[61px] text-[16px] leading-[24px]">{String(admin.id).padStart(6, '0')}</div>

                  {/* Name */}
                  <div className="w-[111px] text-[16px] leading-[24px] truncate">{admin.name} {admin.surname}</div>

                  {/* Phone */}
                  <div className="w-[150px] text-[16px] leading-[24px] truncate">{admin.phone || "+994 00 000 00 00"}</div>

                  {/* Email */}
                  <div className="w-[130px] text-[16px] leading-[24px] truncate">{admin.email}</div>

                  {/* Delete Action */}
                  <div className="flex-1 flex justify-center">
                    <button 
                      onClick={() => setDeleteAdminId(admin.id)}
                      className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity"
                    >
                      <Image src="/trash.png" width={20} height={20} alt="Delete" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="w-full flex justify-end mt-1">
          <button 
            onClick={() => setModalOpen(true)}
            className="w-[193px] h-12 bg-[#00b4cc] rounded-[12px] flex items-center justify-end px-3 gap-3 text-[#fafafa] hover:opacity-90 transition-opacity"
          >
            <span className="text-[16px] leading-[24px]">Admin əlavə et</span>
            <div className="w-6 h-6 flex items-center justify-center">
              <Image src="/trainer-add.svg" width={24} height={24} alt="Add" />
            </div>
          </button>
        </div>
      </div>

      {/* Add Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-black">
          <div className="w-full max-w-[500px] bg-white rounded-[14px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-6 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#101828]">Yeni Admin Əlavə Et</h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md transition-colors"
              >
                 <X size={16} className="text-[#101828]" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#364153]">Ad</label>
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                    placeholder="Məs: Kamal"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#364153]">Soyad</label>
                  <input 
                    type="text"
                    required
                    value={form.surname}
                    onChange={e => setForm({...form, surname: e.target.value})}
                    className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                    placeholder="Məs: Aliyev"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">E-poçt</label>
                <input 
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                  placeholder="admin@mail.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">Telefon nömrəsi</label>
                <input 
                  type="text"
                  value={form.phoneNumber}
                  onChange={e => setForm({...form, phoneNumber: e.target.value})}
                  className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                  placeholder="+994 00 000 00 00"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">Şifrə</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00b4cc]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-12 rounded-[10px] border border-[#00b4cc] text-black text-[16px] font-medium hover:bg-slate-50"
                >
                  Bağla
                </button>
                <button 
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 h-12 bg-[#00b4cc] text-white rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {isAdding ? <Loader2 size={20} className="animate-spin" /> : "Təsdiq et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteAdminId !== null && (
        <ConfirmDeleteModal
          name={admins?.find((a: any) => a.id === deleteAdminId)?.name || "Admin"}
          onConfirm={handleDelete}
          onCancel={() => setDeleteAdminId(null)}
          isLoading={deleteAdmin.isPending}
        />
      )}
    </div>
  );
}
