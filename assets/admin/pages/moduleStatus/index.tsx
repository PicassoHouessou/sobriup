import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AddOrEdit from '@Admin/pages/moduleStatus/AddOrEdit';
import Home from '@Admin/pages/moduleStatus/Home';

const ModuleStatuses = () => {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path=":page" element={<Home />} />
                <Route path="add" element={<AddOrEdit />} />
                <Route path="edit/:id" element={<AddOrEdit />} />
            </Routes>
        </React.StrictMode>
    );
};
export default ModuleStatuses;
