import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { AdminPages, environment } from '@Admin/config';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@Admin/utils';
import { useAddUserMutation } from '@Admin/services/usersApi';
import { UserRegistration } from '@Admin/models';

const initialState: UserRegistration & { confirmPassword: string } = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
};

export default function Signup() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formValue, setFormValue] = useState<
        UserRegistration & { confirmPassword: string }
    >(initialState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [addUser] = useAddUserMutation();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValue({
            ...formValue,
            [name]: value,
        });
        setErrors((prevState) => ({ ...prevState, [name]: '' }));
        if (name == 'confirmPassword' && value != formValue.password) {
            setErrors((prevState) => ({
                ...prevState,
                [name]: t("Le mot de passe n'est pas le même"),
            }));
        }
        if (name == 'confirmPassword' && value == formValue.password) {
            setErrors((prevState) => ({ ...prevState, [name]: '' }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const user = await addUser({
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                email: formValue.email,
                password: formValue.password,
            }).unwrap();
            setErrors({});
            navigate(AdminPages.VERIFY + '?id=' + user.id);
            toast.success(t('Bienvenue, votre compte est créé '));
        } catch (err) {
            const { detail, errors } = getErrorMessage(err);
            if (errors) {
                setErrors(errors);
            }
            toast.error(detail);
        }
    };

    return (
        <div className="page-sign">
            <Card className="card-sign">
                <Card.Header>
                    <Link to={AdminPages.DASHBOARD} className="header-logo mb-4">
                        {environment.appName}
                    </Link>
                    <Card.Title>{t("S'inscrire")}</Card.Title>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <Form.Label>{t('Adresse email')}</Form.Label>
                            <Form.Control
                                type="text"
                                name="email"
                                placeholder={t('Entrer votre adresse email')}
                                onChange={handleInputChange}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.email}
                            </Form.Control.Feedback>
                        </div>
                        <div className="mb-3">
                            <Form.Label>{'Nom'}</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                placeholder={t('Entrez votre nom')}
                                value={formValue.lastName}
                                onChange={handleInputChange}
                                isInvalid={!!errors.lastName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.lastName}
                            </Form.Control.Feedback>
                        </div>
                        <div className="mb-3">
                            <Form.Label>{'Prénoms'}</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                placeholder={t('Entrez votre prénom')}
                                value={formValue.firstName}
                                onChange={handleInputChange}
                                isInvalid={!!errors.firstName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.firstName}
                            </Form.Control.Feedback>
                        </div>
                        <div className="mb-3">
                            <Form.Label>{t('Mot de passe')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formValue.password}
                                onChange={handleInputChange}
                                isInvalid={!!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.password}
                            </Form.Control.Feedback>
                        </div>
                        <div className="mb-3">
                            <Form.Label>{t('Même mot de passe')}</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formValue.confirmPassword}
                                onChange={handleInputChange}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.confirmPassword}
                            </Form.Control.Feedback>
                        </div>

                        <Button variant="primary" className="btn-sign" type="submit">
                            {t('Créer un compte')}
                        </Button>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    {'Vous avez déja un compte'}{' '}
                    <Link to={AdminPages.SIGN_IN}>{'Se connecter'}</Link>
                </Card.Footer>
            </Card>
        </div>
    );
}
