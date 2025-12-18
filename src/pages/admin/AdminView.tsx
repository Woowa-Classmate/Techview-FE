import { useLocation, Navigate } from 'react-router-dom';
import { AdminHeaderProvider } from '@/contexts/AdminHeaderContext';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { UserManagement } from '@/components/admin/management/UserManagement';
import { BoardManagement } from '@/components/admin/management/BoardManagement';
import { BehaviorAnalysis } from '@/components/admin/management/BehaviorAnalysis';
import { MissionManagement } from '@/components/admin/management/MissionManagement';

const AdminView = () => {
  const location = useLocation();

  // /admin 접근 시 첫 번째 메뉴(미션)로 리다이렉트
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/missions" replace />;
  }

  const renderContent = () => {
    if (location.pathname.includes('/missions')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000] overflow-auto">
          <div className="p-6 h-full">
            <MissionManagement />
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
    if (location.pathname.includes('/board')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000] overflow-auto">
          <div className="p-6 h-full">
            <BoardManagement />
          </div>
        </div>
      );
    }
    if (location.pathname.includes('/behavior')) {
      return (
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-[#000000]">
          <BehaviorAnalysis />
        </div>
      );
    }
    // 기본값: 미션 페이지로 리다이렉트
    return <Navigate to="/admin/missions" replace />;
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

