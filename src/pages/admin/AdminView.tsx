import { useLocation } from 'react-router-dom';
import { AdminHeaderProvider } from '@/contexts/AdminHeaderContext';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { CardManagement } from '@/components/admin/management/CardManagement';
import { UserManagement } from '@/components/admin/management/UserManagement';
import { BehaviorAnalysis } from '@/components/admin/management/BehaviorAnalysis';
import { DashboardContent } from '@/components/admin/dashboard/DashboardContent';

const AdminView = () => {
  const location = useLocation();

  const renderContent = () => {
    if (location.pathname.includes('/cards')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000] overflow-auto">
          <div className="p-6 h-full">
            <CardManagement />
          </div>
        </div>
      );
    }
    if (location.pathname.includes('/users')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000] overflow-auto">
          <div className="p-6 h-full">
            <UserManagement />
          </div>
        </div>
      );
    }
    if (location.pathname.includes('/behavior')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000] overflow-auto">
          <BehaviorAnalysis />
        </div>
      );
    }
    return (
      <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000]">
        <DashboardContent />
      </div>
    );
  };

  return (
    <AdminHeaderProvider>
      <AdminLayout>
        {renderContent()}
      </AdminLayout>
    </AdminHeaderProvider>
  );
};

export default AdminView;

