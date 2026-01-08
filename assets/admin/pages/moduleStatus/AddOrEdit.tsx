import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import {
    useAddModuleStatusMutation,
    useModuleStatusQuery,
    useUpdateModuleStatusMutation,
} from '@Admin/services/modulesApi';
import { ModuleStatus } from '@Admin/models';
import { getErrorMessage } from '@Admin/utils';
import { AdminPages } from '@Admin/config';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const initialState = {
    id: '',
    name: '',
    slug: '',
    color: '',
    description: '',
};

export default function AddOrEdit() {
    const { t } = useTranslation();

    const [, setSkin] = useSkinMode();
    const [formValue, setFormValue] = useState<ModuleStatus>(initialState);
    const [editMode, setEditMode] = useState(false);
    const [addData] = useAddModuleStatusMutation();
    const [updateData] = useUpdateModuleStatusMutation();
    const navigate = useNavigate();
    const idParam = useParams().id as unknown as number;
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { data } = useModuleStatusQuery(idParam!, {
        skip: idParam ? false : true,
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
            switch (action.name) {
                default:
                    const { value } = e;
                    setFormValue({
                        ...formValue,
                        [action.name]: value,
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
                await addData(data).unwrap();
                setErrors({});
                navigate(-1);
                toast.success(t('État enregistré'));
            } else {
                setErrors({});
                await updateData({
                    ...data,
                    id,
                }).unwrap();
                navigate(-1);
                toast.success(t('État enregistré'));
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
                                <Link to={AdminPages.MODULES}>{t('Modules')}</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {t('Ajout')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">
                            {t('Ajouter un état de module')}
                        </h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULE_STATUSES}>
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
                                        <Form.Label htmlFor="name">{t('Nom')}</Form.Label>
                                        <Form.Control
                                            id="name"
                                            name="name"
                                            value={formValue.name}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.name}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="slug">
                                            {t('Slug')}
                                        </Form.Label>
                                        <Form.Control
                                            id="slug"
                                            name="slug"
                                            value={formValue.slug}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.slug}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.slug}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="color">
                                            {t('Couleur')}
                                        </Form.Label>
                                        <Form.Control
                                            id="color"
                                            name="color"
                                            value={formValue.color}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.color}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.color}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="description">
                                            {t('Description')}
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            id="description"
                                            name="description"
                                            rows={3}
                                            value={formValue.description}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.description}
                                        ></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.description}
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
