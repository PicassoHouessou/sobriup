import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import pageSvg from '../assets/svg/server_down.svg';
import { AdminPages } from '@Admin/config';
import { useTranslation } from 'react-i18next';
import AuthLayout from '@Admin/pages/AuthLayout';

export default function NotFound() {
    const { t } = useTranslation();
    document.body.classList.remove('sidebar-show');

    return (
        <div className="page-error">
            <AuthLayout />
            <div className="content">
                <Container>
                    <Row className="gx-5">
                        <Col lg="5" className="d-flex flex-column align-items-center">
                            <h1 className="error-number">404</h1>
                            <h2 className="error-title">{t('Page introuvable')}</h2>
                            <p className="error-text">
                                {t(
                                    "Oopps. La page que vous recherchez n'existe pas. Il se peut que vous ayez mal saisi l'adresse ou que la page ait été déplacée.",
                                )}
                            </p>
                            <Link
                                to={AdminPages.DASHBOARD}
                                className="btn btn-primary btn-error"
                            >
                                {t('Retour au tableau de bord')}
                            </Link>
                        </Col>
                        <Col xs="8" lg="6" className="mb-5 mb-lg-0">
                            <object
                                type="image/svg+xml"
                                data={pageSvg}
                                className="w-100"
                                aria-label="svg image"
                            ></object>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}
