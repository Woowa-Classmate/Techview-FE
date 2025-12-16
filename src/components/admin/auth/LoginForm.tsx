import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Button } from '@/components/admin/ui/button';
import { Input } from '@/components/admin/ui/input';
import { Label } from '@/components/admin/ui/label';
import { Checkbox } from '@/components/admin/ui/checkbox';

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAdminAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="email" className="text-base font-medium text-gray-900 dark:text-white">
          이메일
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white h-14 text-base placeholder:text-gray-500 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="password" className="text-base font-medium text-gray-900 dark:text-white">
          비밀번호
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-white pr-12 h-14 text-base placeholder:text-gray-500 dark:placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 text-gray-500 transition-colors -translate-y-1/2 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center pt-2 space-x-3">
        <Checkbox
          id="remember"
          className="size-5 border-gray-300 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        />
        <Label htmlFor="remember" className="text-base text-gray-600 cursor-pointer dark:text-gray-400">
          로그인 상태 유지
        </Label>
      </div>

      {error && (
        <div className="pt-2 text-base text-center text-red-600 dark:text-red-400">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full h-14 text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
        disabled={isLoading}
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}

