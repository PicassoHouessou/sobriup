import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'react-bootstrap';
import Footer from '@Admin/layouts/Footer';

import img1 from '@Admin/assets/img/img1.jpg';
import Header from '@Admin/layouts/Header';
import { useSkinMode } from '@Admin/hooks';

export default function Home() {
    const [, setSkin] = useSkinMode();

    return (
        <React.Fragment>
            <Header onSkin={setSkin} />
            <div className="main main-app p-3 p-lg-4">
                <div className="d-md-flex align-items-center justify-content-between mb-4">
                    <div>
                        <ol className="breadcrumb fs-sm mb-1">
                            <li className="breadcrumb-item">
                                <Link to="#">Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Profile
                            </li>
                        </ol>
                    </div>
                </div>

                <Row className="g-5">
                    <Col xl>
                        <div className="media-profile mb-5">
                            <div className="media-img mb-3 mb-sm-0">
                                <img src={img1} className="img-fluid" alt="..." />
                            </div>
                            <div className="media-body">
                                <h5 className="media-name">Shaira Diaz</h5>
                                <p className="d-flex gap-2 mb-4">
                                    <i className="ri-map-pin-line"></i> San Francisco,
                                    California
                                </p>
                                <p className="mb-0">
                                    Redhead, Innovator, Saviour of Mankind, Hopeless
                                    Romantic, Attractive 20-something Yogurt Enthusiast.
                                    You can replace this with any content and adjust it as
                                    needed... <Link to="">Read more</Link>
                                </p>
                                <Link to="/profiles/edit">
                                    <Button>Modifier</Button>
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Footer />
            </div>
        </React.Fragment>
    );
}
