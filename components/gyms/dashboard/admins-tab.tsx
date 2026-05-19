"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Loader2, Eye, EyeOff, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymAdmins, useAddGymAdmin, useDeleteGymAdmin, useUpdateGymAdmin } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";

import { useT } from "@/lib/i18n";

export function AdminsTab() {
  const t = useT();
  const { gymId } = useGymStore();
  const { data: admins, isLoading } = useGymAdmins(gymId);
  const { mutate: addAdmin, isPending: isAdding } = useAddGymAdmin();
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateGymAdmin();
  const { mutate: deleteAdmin, isPending: isDeletingAdmin } = useDeleteGymAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [form, setForm] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "Admin"
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;

    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = t.validation.nameRequired;
    else if (form.name.length < 2 || form.name.length > 50) errors.name = t.validation.nameLength;

    if (!form.surname.trim()) errors.surname = t.validation.surnameRequired;
    else if (form.surname.length < 2 || form.surname.length > 50) errors.surname = t.validation.surnameLength;

    if (!form.email.trim()) errors.email = t.validation.emailRequired;
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.email)) errors.email = t.validation.emailInvalid;

    if (!form.phoneNumber.trim()) errors.phoneNumber = t.validation.phoneRequired;
    else if (!/^(\+994|0)?\s?(10|50|51|55|60|70|77|99)(\s?\d){7}$/.test(form.phoneNumber)) errors.phoneNumber = t.validation.phoneInvalid;

    if (!editingAdminId) {
      if (!form.password) errors.password = t.validation.passwordRequired;
      else if (form.password.length < 8) errors.password = t.validation.passwordMinLength;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    if (editingAdminId) {
      updateAdmin(
        { gymId: Number(gymId), adminId: editingAdminId, payload: { ...form, password: undefined } },
        {
          onSuccess: () => {
            setModalOpen(false);
            setEditingAdminId(null);
            setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "", role: "Admin" });
            setShowSuccessModal(true);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || t.error.generic);
          }
        }
      );
    } else {
      addAdmin(
        { gymId: Number(gymId), payload: form },
        {
          onSuccess: () => {
            setModalOpen(false);
            setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "", role: "Admin" });
            setShowSuccessModal(true);
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message || t.error.generic);
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!gymId || !deleteAdminId) return;
    deleteAdmin({ gymId: Number(gymId), adminId: deleteAdminId }, {
      onSuccess: () => {
        setDeleteAdminId(null);
        setShowSuccessModal(true);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="font-medium font-sans">{t.admin.adminsLoading}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-2 font-sans text-black">
      {/* Main Container */}
      <div className="w-full bg-white rounded-[12px] border border-[#ececed] flex flex-col items-start p-4 gap-5">
        
        {/* Title Section */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px] text-black">{t.admin.title}</h2>
        </div>

        {/* Table Section */}
        <div className="w-full flex flex-col items-start">
          {/* Table Header */}
          <div className="w-full grid grid-cols-[1.5fr_1fr_2fr_2fr_2fr_40px] items-center bg-[#00b4cc]/10 border border-[#ececed] rounded-t-lg px-[16px] py-3.5 gap-4">
            <div className="text-[14px] leading-[20px] font-semibold text-black">{t.common.role}</div>
            <div className="text-[14px] leading-[20px] font-semibold text-black">{t.common.id}</div>
            <div className="text-[14px] leading-[20px] font-semibold text-black">{t.common.name} / {t.common.surname}</div>
            <div className="text-[14px] leading-[20px] font-semibold text-black">{t.common.phone}</div>
            <div className="text-[14px] leading-[20px] font-semibold text-black">{t.common.email}</div>
            <div className="text-[14px] leading-[20px] font-semibold text-black text-center">{t.common.more}</div>
          </div>

          {/* Table Body */}
          <div className="w-full flex flex-col">
            {admins?.length === 0 ? (
              <div className="w-full bg-white border-x border-b border-[#ececed] p-8 text-center text-slate-400 text-sm">
                {t.admin.noAdmins}
              </div>
            ) : (
              admins?.map((admin: any) => (
                <div key={admin.id} className="w-full grid grid-cols-[1.5fr_1fr_2fr_2fr_2fr_40px] items-center bg-white border-x border-b border-[#ececed] px-[16px] py-3 gap-4 hover:bg-slate-50 transition-colors text-[14px]">
                  {/* Role Badge */}
                  <div>
                    <div className="inline-flex w-[120px] items-center justify-center bg-[#00b4cc] border border-[#ececed] rounded-[4px] px-2 py-0.5 gap-2 text-white">
                      <div className="w-4 h-4 relative shrink-0">
                        <Image 
                          src={admin.role === "Super admin" ? "/superAdmin.svg" : "/admin.svg"} 
                          fill 
                          alt="Role" 
                          className={cn("object-contain", admin.role === "Super admin" ? "p-[2px]" : "p-[1px]")}
                        />
                      </div>
                      <span className="text-[13px] font-medium leading-[20px] truncate">
                        {admin.role === "Super admin" ? t.admin.superAdmin : t.admin.adminRole}
                      </span>
                    </div>
                  </div>

                  {/* ID */}
                  <div className="text-[16px] leading-[24px]">{String(admin.id).padStart(6, '0')}</div>

                  {/* Name */}
                  <div className="text-[16px] leading-[24px] truncate">{admin.name} {admin.surname}</div>

                  {/* Phone */}
                  <div className="text-[16px] leading-[24px] truncate">{admin.phone || "+994 00 000 00 00"}</div>

                  {/* Email */}
                  <div className="text-[16px] leading-[24px] truncate">{admin.email}</div>

                  {/* Actions */}
                  <div className="flex justify-center relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === admin.id ? null : admin.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
                    >
                      <Image src="/more.png" width={20} height={20} alt="More" />
                    </button>
                    {openDropdownId === admin.id && (
                      <div ref={dropdownRef} className="absolute right-0 top-10 w-[140px] bg-white rounded-lg shadow-xl border border-[#ececed] py-1 z-[10]">
                         <button onClick={() => { 
                           setEditingAdminId(admin.id); 
                           setForm({ name: admin.name, surname: admin.surname, phoneNumber: admin.phone || "", email: admin.email || "", password: "", role: admin.role || "Admin" }); 
                           setFormErrors({});
                           setModalOpen(true); 
                           setOpenDropdownId(null); 
                         }} className="w-full text-left px-4 py-2 text-[14px] font-medium hover:bg-slate-50 flex items-center gap-2">
                           <Edit size={16} className="text-[#6a7282]" />
                           {t.common.edit}
                         </button>
                         <button onClick={() => { setDeleteAdminId(admin.id); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
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

        {/* Footer Action */}
        <div className="w-full flex justify-end mt-1">
          <button 
            onClick={() => {
              setEditingAdminId(null);
              setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "", role: admins?.length === 0 ? "Super admin" : "Admin" });
              setFormErrors({});
              setModalOpen(true);
            }}
            className="w-[180px] h-10 bg-[#00b4cc] rounded-lg flex items-center justify-end px-3 gap-3 text-[#fafafa] hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="text-sm font-medium leading-[20px]">{t.admin.addAdmin}</span>
            <div className="w-5 h-5 flex items-center justify-center">
              <Image src="/trainer-add.svg" width={20} height={20} alt="Add" />
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
              <h2 className="text-[18px] font-bold text-[#101828]">{editingAdminId ? t.admin.editAdmin : t.admin.addAdmin}</h2>
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
                  <label className="text-[14px] font-medium text-[#364153]">{t.common.name}</label>
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={e => {setForm({...form, name: e.target.value}); setFormErrors({...formErrors, name: ""});}}
                    className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.name ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                    placeholder={t.placeholder.adminName}
                  />
                  {formErrors.name && <span className="text-[12px] text-red-500">{formErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-medium text-[#364153]">{t.common.surname}</label>
                  <input 
                    type="text"
                    required
                    value={form.surname}
                    onChange={e => {setForm({...form, surname: e.target.value}); setFormErrors({...formErrors, surname: ""});}}
                    className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.surname ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                    placeholder={t.placeholder.adminSurname}
                  />
                  {formErrors.surname && <span className="text-[12px] text-red-500">{formErrors.surname}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">{t.common.email}</label>
                <input 
                  type="email"
                  required
                  value={form.email}
                  onChange={e => {setForm({...form, email: e.target.value}); setFormErrors({...formErrors, email: ""});}}
                  className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.email ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                  placeholder={t.placeholder.email}
                />
                {formErrors.email && <span className="text-[12px] text-red-500">{formErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">{t.common.phone}</label>
                <input 
                  type="text"
                  value={form.phoneNumber}
                  onChange={e => {setForm({...form, phoneNumber: e.target.value}); setFormErrors({...formErrors, phoneNumber: ""});}}
                  className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                  placeholder={t.placeholder.phone}
                />
                {formErrors.phoneNumber && <span className="text-[12px] text-red-500">{formErrors.phoneNumber}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">{t.common.role}</label>
                <select 
                  value={form.role || "Admin"}
                  onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full h-11 px-4 bg-white border border-[#dddcdc] rounded-xl outline-none focus:border-[#00b4cc] text-[14px]"
                >
                  <option value="Super admin">{t.admin.superAdmin}</option>
                  <option value="Admin">{t.admin.adminRole}</option>
                </select>
              </div>

              {!editingAdminId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">{t.common.password}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => {setForm({...form, password: e.target.value}); setFormErrors({...formErrors, password: ""});}}
                    className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.password ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                    placeholder={t.placeholder.password}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00b4cc]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <span className="text-[12px] text-red-500">{formErrors.password}</span>}
              </div>
              )}

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-12 rounded-[10px] border border-[#00b4cc] text-black text-[16px] font-medium hover:bg-slate-50"
                >
                  {t.common.close}
                </button>
                <button 
                  type="submit"
                  disabled={isAdding || isUpdating}
                  className="flex-1 h-12 bg-[#00b4cc] text-white rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {isAdding || isUpdating ? <Loader2 size={20} className="animate-spin" /> : t.common.confirm}
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
          isLoading={isDeletingAdmin}
        />
      )}
      <SuccessAnimationModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
