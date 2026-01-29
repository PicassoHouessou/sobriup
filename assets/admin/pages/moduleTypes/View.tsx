import React from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link } from 'react-router';
import Footer from '../../layouts/Footer';
import Header from '../../layouts/Header';
import Select from 'react-select';
import { useSkinMode } from '@Admin/hooks';
import { AdminPages } from '@Admin/config';

export default function View() {
    const [, setSkin] = useSkinMode();

    const selectOptions = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' },
    ];
    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to={AdminPages.MODULE_TYPES}>Modules</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Ajout
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">Ajouter un équipement</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Link to={AdminPages.MODULE_TYPES}>
                            <Button
                                variant=""
                                className="btn-white d-flex align-items-center gap-2"
                            >
                                <i className="ri-arrow-go-back-line fs-18 lh-1"></i>
                                Retour
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="main main-docs">
                    <Container>
                        <Card>
                            <Card.Body>
                                <div className="mb-3">
                                    <Form.Label htmlFor="exampleFormControlInput1">
                                        Nom
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        id="exampleFormControlInput1"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                <div className="mb-3">
                                    <Form.Label htmlFor="exampleFormControlTextarea1">
                                        Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        id="exampleFormControlTextarea1"
                                        rows={3}
                                        placeholder="Enter message here..."
                                    ></Form.Control>
                                </div>
                                <div className="mb-3">
                                    <Form.Label htmlFor="exampleFormControlTextarea1">
                                        Type
                                    </Form.Label>
                                    <Select options={selectOptions} isSearchable={true} />
                                </div>
                                <div>
                                    <Button variant="primary">Enregistrer</Button>
                                </div>
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
