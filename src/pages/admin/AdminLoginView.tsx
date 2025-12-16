import { LoginForm } from '@/components/admin/auth/LoginForm';
import { useEffect } from 'react';

const AdminLoginView = () => {
  useEffect(() => {
    // localStorage에서 테마 설정을 읽어서 적용
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // 기본값은 다크 모드
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="mb-4 text-6xl font-bold text-center text-gray-900 dark:text-white">Techview</h1>
        <p className="mb-12 text-lg text-center text-gray-600 dark:text-gray-400">관리자 로그인</p>
        
        <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-12 shadow-xl border border-gray-200 dark:border-[#1a1a1a]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginView;
