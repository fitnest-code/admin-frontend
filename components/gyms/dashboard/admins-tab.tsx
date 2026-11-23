"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Loader2, Eye, EyeOff, Edit, Trash, KeyRound } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { cn, normalizePhoneNumber } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymAdmins, useAddGymAdmin, useDeleteGymAdmin, useUpdateGymAdmin, useResetGymAdminPassword } from "@/lib/query/gym-query";

import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";

import { useT } from "@/lib/i18n";
import { AdminDataTable, type AdminDataTableColumn } from "@/components/ui/admin-data-table";

export function AdminsTab() {
  const t = useT();
  const { gymId } = useGymStore();
  const { data: admins, isLoading } = useGymAdmins(gymId);
  const { mutate: addAdmin, isPending: isAdding } = useAddGymAdmin();
  const { mutate: updateAdmin, isPending: isUpdating } = useUpdateGymAdmin();
  const { mutate: deleteAdmin, isPending: isDeletingAdmin } = useDeleteGymAdmin();
  const { mutate: resetPassword, isPending: isResettingPassword } = useResetGymAdminPassword();

  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<number | null>(null);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [resetPasswordAdminId, setResetPasswordAdminId] = useState<{ id: number; userId: number } | null>(null);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

    if (form.email.trim()) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.email)) {
        errors.email = t.validation.emailInvalid;
      }
    }

    const normalizedPhone = normalizePhoneNumber(form.phoneNumber);
    if (!form.phoneNumber.trim()) errors.phoneNumber = t.validation.phoneRequired;
    else if (!/^\+994(10|50|51|55|60|70|77|99)\d{7}$/.test(normalizedPhone)) errors.phoneNumber = t.validation.phoneInvalid;

    if (!editingAdminId) {
      if (!form.password) errors.password = t.validation.passwordRequired;
      else if (form.password.length < 8) errors.password = t.validation.passwordMinLength;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const submitPayload = { ...form, phoneNumber: normalizedPhone };

    if (editingAdminId) {
      updateAdmin(
        { gymId: Number(gymId), adminId: editingAdminId, payload: { ...submitPayload, password: undefined } },
        {
          onSuccess: () => {
            setModalOpen(false);
            setEditingAdminId(null);
            setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "", role: "Admin" });
            setModalConfig({ isOpen: true, message: t.admin.adminUpdated || "Admin uğurla yeniləndi", type: "success" });
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || t.error.generic;
            setModalConfig({ isOpen: true, message: msg, type: "error" });
          }
        }
      );
    } else {
      addAdmin(
        { gymId: Number(gymId), payload: submitPayload },
        {
          onSuccess: () => {
            setModalOpen(false);
            setForm({ name: "", surname: "", phoneNumber: "", email: "", password: "", role: "Admin" });
            setModalConfig({ isOpen: true, message: t.admin.adminAdded || "Admin uğurla əlavə edildi", type: "success" });
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || t.error.generic;
            setModalConfig({ isOpen: true, message: msg, type: "error" });
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
        setModalConfig({ isOpen: true, message: t.admin.adminDeleted || "Admin silindi", type: "success" });
      },
      onError: (err: any) => {
        setDeleteAdminId(null);
        const msg = err?.response?.data?.message || err?.message || t.error.generic;
        setModalConfig({ isOpen: true, message: msg, type: "error" });
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordAdminId) return;
    
    if (form.password.length < 8) {
      setFormErrors({ password: t.validation?.passwordMinLength || "Şifrə ən azı 8 simvol olmalıdır" });
      return;
    }

    resetPassword({ userId: resetPasswordAdminId.userId, payload: { newPassword: form.password } }, {
      onSuccess: () => {
        setResetPasswordAdminId(null);
        setForm({ ...form, password: "" });
        setFormErrors({});
        setModalConfig({ isOpen: true, message: "Şifrə uğurla yeniləndi", type: "success" });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || t.error.generic;
        setModalConfig({ isOpen: true, message: msg, type: "error" });
      }
    });
  };

  const adminRows = admins ?? [];

  const columns: AdminDataTableColumn<any>[] = useMemo(
    () => [
      {
        id: "role",
        label: t.common.role,
        defaultWidth: 140,
        minWidth: 120,
        maxWidth: 180,
        render: (admin) => (
          <div className="inline-flex w-[120px] items-center justify-center gap-2 rounded border border-[#ececed] bg-[#00b4cc] px-2 py-0.5 text-white">
            <div className="relative h-4 w-4 shrink-0">
              <Image
                src={admin.role === "Super admin" ? "/superAdmin.svg" : "/admin.svg"}
                fill
                alt="Role"
                className={cn("object-contain", admin.role === "Super admin" ? "p-[2px]" : "p-[1px]")}
              />
            </div>
            <span className="truncate text-[13px] font-medium leading-[20px]">
              {admin.role === "Super admin" ? t.admin.superAdmin : t.admin.adminRole}
            </span>
          </div>
        ),
      },
      {
        id: "id",
        label: t.common.id,
        defaultWidth: 90,
        minWidth: 70,
        maxWidth: 120,
        render: (admin) => <span className="block truncate tabular-nums">{String(admin.id).padStart(6, "0")}</span>,
      },
      {
        id: "name",
        label: `${t.common.name} / ${t.common.surname}`,
        defaultWidth: 200,
        minWidth: 140,
        maxWidth: 320,
        flex: true,
        render: (admin) => (
          <span className="block truncate">
            {admin.name} {admin.surname}
          </span>
        ),
      },
      {
        id: "phone",
        label: t.common.phone,
        defaultWidth: 160,
        minWidth: 120,
        maxWidth: 220,
        render: (admin) => <span className="block truncate">{admin.phone || "+994 00 000 00 00"}</span>,
      },
      {
        id: "email",
        label: t.common.email,
        defaultWidth: 200,
        minWidth: 140,
        maxWidth: 320,
        flex: true,
        render: (admin) => <span className="block truncate">{admin.email}</span>,
      },
      {
        id: "actions",
        label: t.common.more,
        defaultWidth: 72,
        minWidth: 64,
        maxWidth: 96,
        reorderable: false,
        hideable: false,
        render: (admin) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="mx-auto flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-70">
                  <Image src="/more.png" width={20} height={20} alt="More" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingAdminId(admin.id);
                    setForm({
                      name: admin.name,
                      surname: admin.surname,
                      phoneNumber: admin.phone || "",
                      email: admin.email || "",
                      password: "",
                      role: admin.role || "Admin",
                    });
                    setFormErrors({});
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} className="text-[#6a7282]" /> Məlumatı yenilə
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setResetPasswordAdminId({ id: admin.id, userId: admin.userId });
                    setForm({ ...form, password: "" });
                    setFormErrors({});
                  }}
                  className="flex items-center gap-2"
                >
                  <KeyRound size={16} className="text-[#6a7282]" /> Şifrəni yenilə
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteAdminId(admin.id)} className="flex items-center gap-2 text-red-600">
                  <Trash size={16} /> {t.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [t, form],
  );

  return (
    <div className="flex flex-col gap-6 py-2 font-sans text-black">
      {/* Main Container */}
      <div className="w-full bg-white rounded-[12px] border border-[#ececed] flex flex-col items-start p-4 gap-5">
        
        {/* Title Section */}
        <div className="w-full border-b border-[#ececed] flex items-center justify-between pb-1">
          <h2 className="text-[18px] font-semibold leading-[28px] text-black">{t.admin.title}</h2>
        </div>

        <AdminDataTable
          storageKey="gym-admins"
          columns={columns}
          rows={adminRows}
          getRowId={(admin) => admin.id}
          isLoading={isLoading}
          emptyTitle={t.admin.noAdmins}
        />

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

      {/* Reset Password Modal */}
      {resetPasswordAdminId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-black">
          <div className="w-full max-w-[400px] bg-white rounded-[14px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#101828]">Şifrəni yenilə</h2>
              <button 
                onClick={() => setResetPasswordAdminId(null)}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md transition-colors"
              >
                 <X size={16} className="text-[#101828]" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-medium text-[#364153]">Yeni şifrə</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => {setForm({...form, password: e.target.value}); setFormErrors({...formErrors, password: ""});}}
                    className={cn("w-full h-11 px-4 bg-white border rounded-xl outline-none text-[14px] transition-all", formErrors.password ? "border-red-500 focus:border-red-500" : "border-[#dddcdc] focus:border-[#00b4cc]")}
                    placeholder="Yeni şifrəni daxil edin"
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

              <div className="flex items-center gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setResetPasswordAdminId(null)}
                  className="flex-1 h-12 rounded-[10px] border border-[#00b4cc] text-black text-[16px] font-medium hover:bg-slate-50"
                >
                  {t.common.close}
                </button>
                <button 
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex-1 h-12 bg-[#00b4cc] text-white rounded-[10px] font-bold text-[16px] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {isResettingPassword ? <Loader2 size={20} className="animate-spin" /> : "Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SuccessAnimationModal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
