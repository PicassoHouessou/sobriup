import React from 'react';
import { Route, Routes } from 'react-router';
 import Home from '@Admin/pages/notifications/Home';

const Users = () => {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path=":page" element={<Home />} />
            </Routes>
        </React.StrictMode>
    );
};
export default Users;
