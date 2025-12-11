import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import { useSkinMode } from '@Admin/hooks';
import { ModuleType } from '@Admin/models';
import {
    useAddModuleTypeMutation,
    useModuleTypeQuery,
    useUpdateModuleTypeMutation,
} from '@Admin/services/modulesApi';
import { getErrorMessage } from '@Admin/utils';
import { toast } from 'react-toastify';

const initialState = {
    id: '',
    name: '',
    description: '',
    type: '',
    unitOfMeasure: '',
    unitDescription: '',
    minValue: 0,
    maxValue: 100,
};

export default function AddOrEdit() {
    const [, setSkin] = useSkinMode();

    const [formValue, setFormValue] = useState<ModuleType>(initialState);

    const [editMode, setEditMode] = useState(false);
    const [addData] = useAddModuleTypeMutation();
    const [updateData] = useUpdateModuleTypeMutation();
    const navigate = useNavigate();

    const idParam = useParams().id as unknown as number;
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { data } = useModuleTypeQuery(idParam!, {
        skip: idParam ? false : true,
    });

    useEffect(() => {
        if (data) {
            // Set the current user to be the one who create or edit the post
            setFormValue((prevState) => ({
                ...prevState,
                ...data,
            }));
            setEditMode(true);
        } else {
            setEditMode(false);
            setFormValue(initialState);
        }
    }, [data]);

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormValue({
            ...formValue,
            [name]: value,
        });
        setErrors((prevState) => ({ ...prevState, [name]: '' }));
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
                toast.success('Enregistrement effectué');
            } else {
                setErrors({});
                await updateData({
                    ...data,
                    id,
                }).unwrap();
                navigate(-1);
                toast.success('Enregistrement effectué');
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
                                <Link to="/modules">Modules</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {editMode ? 'Modification' : 'Ajout'}
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">
                            {editMode ? 'Modifier' : 'Ajout'} un type de module
                        </h4>
                    </div>
                    {/*
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULE_TYPES}>
                            <Button variant="" className="btn-white d-flex align-items-center gap-2">
                                <i className="ri-arrow-go-back-line fs-18 lh-1"></i>Retour
                            </Button>
                        </Link>
                    </div>
                    */}
                </div>

                <div className="main main-docs">
                    <Container>
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="name">Nom</Form.Label>
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
                                            Description
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
                                    <div className="mb-3">
                                        <Form.Label htmlFor="unitOfMeasure">
                                            Unité (Symbole)
                                        </Form.Label>
                                        <Form.Control
                                            id="unitOfMeasure"
                                            name="unitOfMeasure"
                                            value={formValue.unitOfMeasure}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.description}
                                        ></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.unitOfMeasure}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <Form.Label htmlFor="unitDescription">
                                            Unité (Détail complémentaire)
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            id="unitDescription"
                                            name="unitDescription"
                                            rows={3}
                                            value={formValue.unitDescription}
                                            onChange={handleInputChange}
                                            isInvalid={!!errors.description}
                                        ></Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.unitDescription}
                                        </Form.Control.Feedback>
                                    </div>
                                    <div className="mb-3">
                                        <div className="row">
                                            <div className="col">
                                                <Form.Label htmlFor="minValue">
                                                    Valeur Minimale
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    id="minValue"
                                                    name="minValue"
                                                    value={formValue.minValue}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.minValue}
                                                ></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.minValue}
                                                </Form.Control.Feedback>
                                            </div>
                                            <div className="col">
                                                <Form.Label htmlFor="maxValue">
                                                    Valeur Maximale
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    id="maxValue"
                                                    name="maxValue"
                                                    value={formValue.maxValue}
                                                    onChange={handleInputChange}
                                                    isInvalid={!!errors.maxValue}
                                                ></Form.Control>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.maxValue}
                                                </Form.Control.Feedback>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Button variant="primary" type="submit">
                                            Enregistrer
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
