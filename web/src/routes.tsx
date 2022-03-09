import React from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";
import ListPoints from "./pages/ListPoints";

const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/register" element={<CreatePoint />}></Route>
                <Route path="/places" element={<ListPoints />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default Router;