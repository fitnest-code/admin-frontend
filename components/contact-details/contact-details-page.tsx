"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useContactDetails, useCreateContactDetails, useUpdateContactDetails } from "@/lib/query/support-query";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { useT } from "@/lib/i18n";

export function ContactDetailsPage() {
  const t = useT();
  const { data: contactDetails, isLoading, refetch } = useContactDetails();
  const { mutate: createContact, isPending: isCreating } = useCreateContactDetails();
  const { mutate: updateContact, isPending: isUpdating } = useUpdateContactDetails();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    email: "",
    mobileNumber: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (contactDetails) {
      setFormData({
        email: contactDetails.email || "",
        mobileNumber: contactDetails.mobile_number || "",
      });
    }
  }, [contactDetails]);

  // Premium formatting function for +994 xx xxx xx xx pattern
  const formatPhoneNumber = (value: string) => {
    if (!value) return "";
    let digits = value.replace(/\D/g, "");
    
    // Automatically prepend 994 if typing new digits not starting with 994
    if (digits.length > 0 && !digits.startsWith("994")) {
      digits = "994" + digits;
    }
    
    digits = digits.substring(0, 12);
    
    let formatted = "+994";
    if (digits.length > 3) {
      formatted += " " + digits.substring(3, 5);
    }
    if (digits.length > 5) {
      formatted += " " + digits.substring(5, 8);
    }
    if (digits.length > 8) {
      formatted += " " + digits.substring(8, 10);
    }
    if (digits.length > 10) {
      formatted += " " + digits.substring(10, 12);
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow standard deleting
    if (val.length < formData.mobileNumber.length) {
      setFormData(prev => ({ ...prev, mobileNumber: val }));
      return;
    }
    setFormData(prev => ({ ...prev, mobileNumber: formatPhoneNumber(val) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = () => {
    if (!formData.mobileNumber.trim()) return;
    navigator.clipboard.writeText(formData.mobileNumber);
    toast.success(t.contactDetails.copied || "Kopyalandı!");
  };

  const handleSave = () => {
    const email = formData.email.trim();
    const phone = formData.mobileNumber.trim();

    if (!email || !phone) {
      toast.error(t.contactDetails.validationFillAll);
      return;
    }

    // Validation standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t.contactDetails.validationEmail);
      return;
    }

    // Validation Azerbaijani phone format +994 xx xxx xx xx (10, 50, 51, 55, 60, 70, 77, 99)
    const phoneRegex = /^\+994\s*(10|50|51|55|60|70|77|99)\s*\d{3}\s*\d{2}\s*\d{2}$/;
    if (!phoneRegex.test(phone)) {
      toast.error(t.contactDetails.validationPhone);
      return;
    }

    const payload = {
      email,
      mobile_number: phone,
    };

    if (contactDetails) {
      updateContact(payload, {
        onSuccess: () => {
          setShowSuccessModal(true);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Xəta baş verdi");
        },
      });
    } else {
      createContact(payload, {
        onSuccess: () => {
          setShowSuccessModal(true);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Xəta baş verdi");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 w-full h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#00B4CC]" size={36} />
        <span className="text-sm font-semibold text-slate-500 animate-pulse">Yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full font-sans p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#ececed] pb-4 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-[#101828] tracking-tight">
            {t.contactDetails.title}
          </h1>
        </div>
      </div>

      {/* Main Content Form Card */}
      <div className="w-full">
        {/* Form */}
        <div className="w-full rounded-2xl bg-white border border-[#ececed] flex flex-col p-6 sm:p-8 gap-8 text-left shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col gap-6">
            {/* Email Input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                {t.contactDetails.email}
              </label>
              <div className={cn(
                "h-[48px] rounded-xl border flex items-center px-4 text-sm transition-all duration-200",
                "bg-white border-[#ececed] focus-within:border-[#00B4CC] focus-within:ring-2 focus-within:ring-[#00B4CC15]"
              )}>
                <input
                  type="email"
                  name="email"
                  placeholder={t.contactDetails.emailPlaceholder}
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent font-medium text-foreground outline-none w-full h-full placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                {t.contactDetails.phone}
              </label>
              <div className={cn(
                "h-[48px] rounded-xl border flex items-center px-4 text-sm transition-all duration-200 relative",
                "bg-white border-[#ececed] focus-within:border-[#00B4CC] focus-within:ring-2 focus-within:ring-[#00B4CC15]"
              )}>
                <input
                  type="text"
                  name="mobileNumber"
                  placeholder={t.contactDetails.phonePlaceholder}
                  value={formData.mobileNumber}
                  onChange={handlePhoneChange}
                  className="bg-transparent font-medium text-foreground outline-none w-full h-full pr-10 placeholder:text-slate-400 placeholder:font-normal"
                />
                {formData.mobileNumber && (
                  <button 
                    onClick={handleCopy}
                    className="absolute right-4 text-slate-400 hover:text-[#00B4CC] transition-colors p-1 hover:bg-slate-50 rounded-md"
                    title="Nömrəni kopyala"
                  >
                    <Copy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end border-t border-[#ececed] pt-6 mt-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                "h-[46px] w-full sm:w-[180px] rounded-xl flex items-center justify-center text-sm font-semibold text-white transition-all shadow-sm select-none",
                "bg-[#00B4CC] hover:bg-[#009DB3] active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
              )}
            >
              {isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                t.contactDetails.save
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Lottie Animation Modal */}
      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t.contactDetails.successMsg}
      />
    </div>
  );
}
