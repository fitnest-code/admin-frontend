"use client";

import { useState } from "react";
import { X, Search, Check, Plus, Loader2 } from "lucide-react";
import { useSupportedServices, useCreateSupportedService } from "@/lib/query/gym-query";
import { useGymStore } from "@/lib/store/gym-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ServiceSelectorModalProps {
  onClose: () => void;
  selectedServiceNames: string[];
  onSelectionChange: (names: string[]) => void;
  activePackageName: string;
}

export function ServiceSelectorModal({ 
  onClose, 
  selectedServiceNames, 
  onSelectionChange,
  activePackageName
}: ServiceSelectorModalProps) {
  const { gymId } = useGymStore();
  const { data: allServices, isLoading } = useSupportedServices(gymId ? Number(gymId) : undefined);
  const createService = useCreateSupportedService();
  
  const [search, setSearch] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [localSelection, setLocalSelection] = useState<string[]>(selectedServiceNames);

  const filteredServices = allServices?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const toggleService = (name: string) => {
    setLocalSelection(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleCreateService = async () => {
    const trimmed = newServiceName.trim();
    if (!trimmed) return toast.error("Xidmət adını daxil edin");
    
    try {
      await createService.mutateAsync({ 
        name: trimmed, 
        gymId: gymId ? Number(gymId) : undefined 
      });
      toast.success("Xidmət yaradıldı");
      setLocalSelection(prev => [...prev, trimmed]);
      setNewServiceName("");
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error(err?.message || "Xəta baş verdi");
    }
  };

  const handleApply = () => {
    onSelectionChange(localSelection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[24px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            {activePackageName} paketinə xidmət əlavə et
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Xidmət axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:border-[#00B4D8] transition-all bg-white"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-[#00B4D8]" size={24} />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">
              {search ? "Axtarışa uyğun xidmət tapılmadı" : "Heç bir xidmət yoxdur"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredServices.map((svc) => {
                const isSelected = localSelection.includes(svc.name);
                return (
                  <div 
                    key={svc.id}
                    onClick={() => toggleService(svc.name)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      isSelected 
                        ? "bg-cyan-50 border-cyan-200 ring-1 ring-cyan-200" 
                        : "bg-white border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <span className={cn("text-sm font-medium", isSelected ? "text-cyan-700" : "text-slate-600")}>
                      {svc.name}
                    </span>
                    {isSelected && (
                      <div className="bg-cyan-500 rounded-full p-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create New Form */}
        <div className="px-6 py-4 border-t bg-slate-50">
          {!showCreateForm ? (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 text-sm font-semibold text-[#00B4D8] hover:text-[#0096B4] transition-colors"
            >
              <Plus size={18} />
              Yeni xidmət yarat
            </button>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase">Yeni xidmət adı</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Məs: Masaj"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#00B4D8]"
                />
                <button 
                  onClick={handleCreateService}
                  disabled={createService.isPending}
                  className="bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0096B4] disabled:opacity-50"
                >
                  {createService.isPending ? <Loader2 className="animate-spin" size={16} /> : "Yarat"}
                </button>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white border border-slate-200 text-slate-400 px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Ləğv et
          </button>
          <button 
            onClick={handleApply}
            className="flex-[2] py-3 rounded-xl bg-[#00B4D8] text-white font-bold hover:bg-[#0096B4] transition-all shadow-lg shadow-cyan-100"
          >
            Tətbiq et ({localSelection.length})
          </button>
        </div>
      </div>
    </div>
  );
}
