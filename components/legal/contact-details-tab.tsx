"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useContactDetails, useCreateContactDetails, useUpdateContactDetails } from "@/lib/query/support-query";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";

export function ContactDetailsTab() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.email.trim() || !formData.mobileNumber.trim()) {
      toast.error("Bütün xanaları doldurun");
      return;
    }

    const payload = {
      email: formData.email.trim(),
      mobile_number: formData.mobileNumber.trim(),
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#00B4CC]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-[12px] bg-white border border-[#ececed] flex flex-col items-start p-4 sm:p-5 gap-8 text-left text-sm text-foreground font-sans shadow-sm">
      <div className="self-stretch flex flex-col items-start gap-[28px]">
        <div className="self-stretch border-b border-[#ececed] flex items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-bold text-[#101828] font-sans tracking-tight">Əlaqə məlumatları</div>
          </div>
        </div>

        <div className="self-stretch flex flex-col items-start gap-5 max-w-[600px]">
          {/* Email Input */}
          <div className="flex-1 w-full flex flex-col items-start gap-3">
            <div className="self-stretch relative leading-[24px]">E-Poçt</div>
            <div className={cn(
              "self-stretch h-[44px] rounded-lg border flex items-center p-[0px_12px] text-sm transition-colors",
              "bg-white border-[#ececed] focus-within:border-[#00B4CC]"
            )}>
              <input
                type="email"
                name="email"
                placeholder="Məs: info@fitnest.az"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent font-semibold text-foreground outline-none w-full h-full"
              />
            </div>
          </div>

          {/* Telefon Input */}
          <div className="flex-1 w-full flex flex-col items-start gap-3">
            <div className="self-stretch relative leading-[24px]">Telefon nömrəsi</div>
            <div className={cn(
              "self-stretch h-[44px] rounded-lg border flex items-center p-[0px_12px] text-sm transition-colors relative",
              "bg-white border-[#ececed] focus-within:border-[#00B4CC]"
            )}>
              <input
                type="text"
                name="mobileNumber"
                placeholder="Məs: +994 50 123 45 67"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="bg-transparent text-foreground outline-none w-full h-full"
              />
              <Copy size={18} className="absolute right-4 text-[#94979c] cursor-pointer hover:text-[#00B4CC]" onClick={() => navigator.clipboard.writeText(formData.mobileNumber)} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="self-stretch flex items-center justify-start mt-6">
          <button
            onClick={handleSave}
            disabled={isPending}
            className={cn(
              "h-[44px] w-full sm:w-[220px] rounded-lg flex items-center justify-center text-[14px] font-semibold text-white transition-all shadow-sm",
              "bg-[#00B4CC] hover:bg-[#009DB3]"
            )}
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : "Yadda saxla"}
          </button>
        </div>
      </div>

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Əlaqə məlumatları uğurla yadda saxlanıldı!"
      />
    </div>
  );
}
