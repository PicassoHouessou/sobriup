import React from 'react';
import { Route, Routes } from 'react-router';
import AddOrEdit from '@Admin/pages/users/AddOrEdit';
import Home from '@Admin/pages/users/Home';

const Users = () => {
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
export default Users;
