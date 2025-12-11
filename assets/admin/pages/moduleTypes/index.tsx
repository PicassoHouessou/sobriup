import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddOrEdit from '@Admin/pages/moduleTypes/AddOrEdit';
import Home from '@Admin/pages/moduleTypes/Home';
import View from '@Admin/pages/moduleTypes/View';

const ModuleTypes = () => {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path=":page" element={<Home />} />
                <Route path="see/*" element={<View />} />
                <Route path="add" element={<AddOrEdit />} />
                <Route path="edit/:id" element={<AddOrEdit />} />
            </Routes>
        </React.StrictMode>
    );
};
export default ModuleTypes;
