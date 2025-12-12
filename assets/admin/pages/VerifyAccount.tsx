import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Nav, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import pageSvg from '../assets/svg/mailbox.svg';
import { useTranslation } from 'react-i18next';
import { AdminPages, APP_NAME, AUTHOR } from '@Admin/config';
import { useResendMutation } from '@Admin/services/usersApi';
import { getErrorMessage } from '@Admin/utils';

export default function VerifyAccount() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [resend] = useResendMutation();
    const [message, setMessage] = useState({ success: '', error: '' });

    const userId = useMemo(() => {
        const id = searchParams.get('id');
        if (id) {
            return parseInt(id);
        }
        return null;
    }, [searchParams]);

    const handleResend = async () => {
        try {
            if (typeof userId !== 'number') {
                setMessage({ success: '', error: t('Identifiant introuvable') });
                return;
            }
            setMessage({ success: '', error: '' });
            await resend(userId).unwrap();
            setMessage({
                success: t('Veuillez vérifier votre boîte de messagerie'),
                error: '',
            });
        } catch (err) {
            const { detail } = getErrorMessage(err);
            setMessage((prevState) => ({
                ...prevState,
                error: detail!,
            }));
        }
    };
    document.body.classList.remove('sidebar-show');

    return (
        <div className="page-auth">
            <div className="header">
                <Container>
                    <Link to={AdminPages.DASHBOARD} className="header-logo">
                        {APP_NAME}
                    </Link>
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

            <div className="content">
                <Container>
                    <Card className="card-auth">
                        <Card.Body className="text-center">
                            <div className="mb-5">
                                <object
                                    type="image/svg+xml"
                                    data={pageSvg}
                                    className="w-50"
                                    aria-label="svg image"
                                ></object>
                            </div>
                            {message && message.error && (
                                <Alert variant="danger">{message.error}</Alert>
                            )}
                            {message && message.success && (
                                <Alert variant="success">{message.success}</Alert>
                            )}
                            <Card.Title>{t('Vérifiez votre adresse e-mail')}</Card.Title>
                            <Card.Text className="mb-5">
                                {t(
                                    'Veuillez vérifier votre courrier électronique et cliquez sur le bouton ou le lien de vérification pour vérifier votre compte',
                                )}
                            </Card.Text>

                            <Row className="g-2 g-sm-3">
                                <Col sm>
                                    <Button variant="primary" onClick={handleResend}>
                                        {t('Renvoyer le lien')}
                                    </Button>
                                </Col>
                                <Col sm>
                                    <a href={`mailto:${AUTHOR.EMAIL}`}>
                                        <Button variant="secondary">
                                            {t('Contacter Support')}
                                        </Button>
                                    </a>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Container>
            </div>
        </div>
    );
}
