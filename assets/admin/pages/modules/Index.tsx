import React from 'react';
import { Route, Routes } from 'react-router';
import AddOrEdit from '@Admin/pages/modules/AddOrEdit';
import Home from '@Admin/pages/modules/Home';
import View from '@Admin/pages/modules/View';

const Modules = () => {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path=":page" element={<Home />} />
                <Route path="see/:id" element={<View />} />
                <Route path="add" element={<AddOrEdit />} />
                <Route path="edit/:id" element={<AddOrEdit />} />
            </Routes>
        </React.StrictMode>
    );
};

export default Modules;
