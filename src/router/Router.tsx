import { Routes, Route } from "react-router-dom";
import { routerList } from "./RouterList";

const Router = () => {
    return (
        <Routes>
            {routerList.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
        </Routes>
    )
}

export default Router;