import { AdminLayout } from "@/components/layout/admin-layout";
import GoalsMain from "@/components/goals/goals-main";

export default function GoalsPage() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Hədəflər</h1>
          <p className="text-gray-400">
            Tətbiqdə görünəcək məşq/həyat tərzi hədəflərini buradan idarə edə bilərsiniz.
          </p>
        </div>
        
        <GoalsMain />
      </div>
    </AdminLayout>
  );
}
