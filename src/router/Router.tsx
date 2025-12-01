import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { routerList } from "./RouterList";

const Router = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">로딩 중...</div>
            </div>
        }>
            <Routes>
                {routerList.map((route) => (
                    <Route 
                        key={route.path} 
                        path={route.path} 
                        element={route.element} 
                    />
                ))}
            </Routes>
        </Suspense>
    );
};

export default Router;