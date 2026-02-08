import { Container, Nav } from 'react-bootstrap';
import { AdminPages, AUTHOR, environment } from '@Admin/config';
import React from 'react';

const AuthLayout = () => {
    return (
        <div className="header">
            <Container>
                <a href={AdminPages.DASHBOARD} className="sidebar-logo">
                    {environment.appName}
                </a>
                <Nav className="nav-icon">
                    <Nav.Link href={AUTHOR.LINKEDIN} target="_blank">
                        <i className="ri-linkedin-fill"></i>
                    </Nav.Link>
                    <Nav.Link href={AUTHOR.GITHUB} target="_blank">
                        <i className="ri-github-fill"></i>
                    </Nav.Link>
                </Nav>
            </Container>
        </div>
    );
};
export default AuthLayout;
