import React, {useEffect, useState} from 'react';
import {Button, Card, Container, Form} from 'react-bootstrap';
import {Link, useNavigate, useParams} from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import {useSkinMode} from '@Admin/hooks';
import {ZoneEdit} from '@Admin/models';
import {useAddZoneMutation, useUpdateZoneMutation, useZoneQuery,} from '@Admin/services/zoneApi';
import {generateIRI, getErrorMessage} from '@Admin/utils';
import {AdminPages, ApiRoutesWithoutPrefix} from '@Admin/config';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';

const initialState = {
    id: '',
    name: '',
    description: '',
    type: '',
};

export default function AddOrEdit() {
    const { t } = useTranslation();
    const [, setSkin] = useSkinMode();

    const [formValue, setFormValue] = useState<ZoneEdit>(initialState);

    const [selectedZoneType, setSelectedZoneType] = useState<any>(null);

    const [editMode, setEditMode] = useState(false);
    const [addData] = useAddZoneMutation();
    const [updateData] = useUpdateZoneMutation();
    const navigate = useNavigate();

    const idParam = useParams().id as unknown as number;
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { data } = useZoneQuery(idParam!, { skip: idParam ? false : true });

    useEffect(() => {
        if (data) {
            // Set the current user to be the one who create or edit the post
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
                case 'type':
                    setSelectedZoneType(e);
                    break;
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
            type: generateIRI(
                ApiRoutesWithoutPrefix.MODULE_TYPES,
                selectedZoneType.id,
            ) as string,
        };

        try {
            if (!editMode) {
                await addData(data).unwrap();
                setErrors({});
                navigate(-1);
                //toast.success(t("Cms Added Successfully"));
            } else {
                setErrors({});
                await updateData({
                    ...data,
                    id,
                }).unwrap();
                navigate(-1);
                toast.success(t('Zone enregistré'));
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
                                <Link to="/modules">{t('Zones')}</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {t('Ajout')}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">{t('Ajouter un module')}</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULES}>
                            <Button
                                variant=""
                                className="btn-white d-flex align-items-center gap-2"
                            >
                                <i className="ri-arrow-go-back-line fs-18 lh-1"></i>
                                Retour
                            </Button>
                        </Link>
                        {/*
                        <Link to="/modules/add">
                            <Button variant="primary" className="d-flex align-items-center gap-2">
                                <i className="ri-add-line fs-18 lh-1"></i>Nouveau
                            </Button>
                        </Link>
                        */}
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
