import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Router from './router/Router'
import TokenExpiredModal from './components/modal/TokenExpiredModal'
import { useTokenExpiredStore } from './stores/tokenExpiredStore'

function App() {
  const location = useLocation();
  const showTokenExpiredModal = useTokenExpiredStore((state) => state.showTokenExpiredModal);

  useEffect(() => {
    // Amplitude 스크립트 동적 로드
    const script1 = document.createElement('script')
    script1.src = 'https://cdn.amplitude.com/script/17e05f26d143e7d8c1553714212c9f10.js'
    script1.async = true
    
    script1.onload = () => {
      // Amplitude 초기화 스크립트
      const script2 = document.createElement('script')
      script2.textContent = `
        window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
        window.amplitude.init('17e05f26d143e7d8c1553714212c9f10', {
          "fetchRemoteConfig": true,
          "logLevel": "WARN",
          "autocapture": {
            "attribution": true,
            "fileDownloads": true,
            "formInteractions": true,
            "pageViews": true,
            "sessions": true,
            "elementInteractions": true,
            "networkTracking": true,
            "webVitals": true,
            "frustrationInteractions": true
          }
        });
      `
      document.body.appendChild(script2)
    }
    
    document.head.appendChild(script1)
    
    return () => {
      // cleanup: 스크립트 제거 (필요한 경우)
      const scripts = document.querySelectorAll('script[src*="amplitude"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  // 토큰 만료 이벤트 리스너
  useEffect(() => {
    const handleTokenExpired = () => {
      // 로그인 관련 페이지에서는 모달을 표시하지 않음
      const isAuthPage = location.pathname === "/login" || 
                         location.pathname === "/signup" || 
                         location.pathname === "/admin/login" ||
                         location.pathname.startsWith("/find-");
      
      if (!isAuthPage) {
        showTokenExpiredModal();
      }
    };

    window.addEventListener('token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, [showTokenExpiredModal, location.pathname]);

  return (
    <div className="App">
      <Router />
      <TokenExpiredModal />
    </div>
  )
}

export default App

