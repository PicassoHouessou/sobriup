import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import {
    useAddUserMutation,
    useUserQuery,
    useUpdateUserMutation,
} from '@Admin/services/usersApi';
import { UserEdit, UserRegistration } from '@Admin/models';
import { getErrorMessage } from '@Admin/utils';
import { AdminPages } from '@Admin/config';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const initialState = {
    id: '',
    lastName: '',
    firstName: '',
    email: '',
    roles: [],
};

export default function AddOrEdit() {
    const { t } = useTranslation();

    const [, setSkin] = useSkinMode();
    const [formValue, setFormValue] = useState<Partial<UserEdit>>(initialState);
    const [editMode, setEditMode] = useState(false);
    const [addData] = useAddUserMutation();
    const [updateData] = useUpdateUserMutation();
    const navigate = useNavigate();
    const idParam = useParams().id as unknown as number;
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { data } = useUserQuery(idParam!, {
        skip: !idParam,
    });

    useEffect(() => {
        if (data) {
            setFormValue({
                ...data,
            });
            setEditMode(true);
        } else {
            setEditMode(false);
        }
    }, [data]);

    const handleInputChange = (e: any, action?: any) => {
        const handleRegularFieldChange = (name: string, value: string) => {
            setFormValue({
                ...formValue,
                [name]: value,
            });
            setErrors((prevState) => ({ ...prevState, [name]: '' }));
        };
        if (typeof action === 'undefined') {
            const { name, value } = e.target;

            handleRegularFieldChange(name, value);
        } else {
            switch (action.lastName) {
                default:
                    const { value } = e;
                    setFormValue({
                        ...formValue,
                        [action.lastName]: value,
                    });
                    break;
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const { id, ...rest } = formValue;
        const data = {
            ...rest,
        };

        try {
            if (!editMode) {
                await addData(data as UserRegistration).unwrap();
                setErrors({});
                navigate(-1);
                toast.success(t('Utilisateur enregistrée'));
            } else {
                setErrors({});
                await updateData({
                    ...data,
                    id,
                }).unwrap();
                navigate(-1);
                toast.success(t('Utilisateur enregistrée'));
            }
        } catch (err) {
            const { detail, errors } = getErrorMessage(err);
            if (errors) {
                setErrors(errors);
            }
            toast.error(detail);
        }
    };
    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to={AdminPages.USERS}>{t('Utilisateurs')}</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {t('Ajout')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{editMode  ? t('Modifier un utilisateur') :t('Ajouter un utilisateur')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.USERS}>
                            <Button
                                variant=""
                                className="btn-white d-flex align-items-center gap-2"
                            >
                                <i className="ri-arrow-go-back-line fs-18 lh-1"></i>
                                {t('Retour')}
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="main main-docs">
                    <Container>
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="lastName">
                                            {t('Nom')}
                                        </Form.Label>
                                        <Form.Control
                                            id="lastName"
                                            name="lastName"
                                            value={formValue.lastName}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.lastName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.lastName}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="firstName">
                                            {t('Prénom')}
                                        </Form.Label>
                                        <Form.Control
                                            id="firstName"
                                            name="firstName"
                                            value={formValue.firstName}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.firstName}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.firstName}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="email">
                                            {t('E-mail')}
                                        </Form.Label>
                                        <Form.Control
                                            id="email"
                                            name="email"
                                            value={formValue.email}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.email}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div>
                                        <Button variant="primary" type="submit">
                                            {t('Enregistrer')}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        <br />
                        <br />
                        <br />
                    </Container>
                </div>
                <Footer />
            </div>
        </React.Fragment>
    );
}
