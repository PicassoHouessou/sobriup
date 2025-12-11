import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '@Admin/pages/profiles/Home';
import Edit from '@Admin/pages/profiles/Edit';

const Posts = () => {
    return (
        <React.StrictMode>
            <Routes>
                <Route path="edit" element={<Edit />} />
                <Route path="/*" element={<Home />} />
                <Route path=":page" element={<Home />} />
            </Routes>
        </React.StrictMode>
    );
};

export default Posts;
