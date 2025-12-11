import React from 'react';
import { Button, Dropdown, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '@Admin/layouts/Footer';
import Header from '@Admin/layouts/Header';
import { CustomToggle } from '@Admin/components/CustomToggle';
import { useSkinMode } from '@Admin/hooks';

export default function Logs() {
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
                                Modules
                            </li>
                        </ol>
                        <h4 className="main-title mb-0">Les modules</h4>
                    </div>
                    <div className="d-flex gap-2 mt-3 mt-md-0">
                        <Button
                            variant=""
                            className="btn-white d-flex align-items-center gap-2"
                        >
                            <i className="ri-bar-chart-2-line fs-18 lh-1"></i>
                            Generate
                            <span className="d-none d-sm-inline"> Report</span>
                        </Button>
                        <Link to="/modules/add">
                            <Button
                                variant="primary"
                                className="d-flex align-items-center gap-2"
                            >
                                <i className="ri-add-line fs-18 lh-1"></i>
                                Ajouter
                            </Button>
                        </Link>
                    </div>
                </div>

                <Row className="g-3">
                    <Table className="table table-files" responsive>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>File Size</th>
                                <th>&nbsp;</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    color: 'primary',
                                    icon: 'ri-folder-5-line',
                                    name: 'Dashboard Concepts',
                                    date: 'Aug 20, 2023',
                                    size: '21.5MB',
                                },
                                {
                                    color: 'primary',
                                    icon: 'ri-folder-5-line',
                                    name: 'Gallery',
                                    date: 'Aug 19, 2023',
                                    size: '341.2MB',
                                },
                            ].map((file, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="media">
                                            <h6 className="file-name">
                                                <Link to="">{file.name}</Link>
                                            </h6>
                                        </div>
                                    </td>
                                    <td>{file.date}</td>
                                    <td>{file.date}</td>
                                    <td>{file.size}</td>
                                    <td>
                                        <Dropdown align="end" className="dropdown-file">
                                            <Dropdown.Toggle as={CustomToggle}>
                                                <i className="ri-more-2-fill"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item className="details">
                                                    <Link to={'/modules/see'}>
                                                        <i className="ri-information-line"></i>{' '}
                                                        Voir Détails
                                                    </Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item href="#" className="share">
                                                    <i className="ri-edit-line"></i>{' '}
                                                    Modifier
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    href="#"
                                                    className="delete"
                                                >
                                                    <i className="ri-delete-bin-line"></i>{' '}
                                                    Delete
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Row>

                <Footer />
            </div>
        </React.Fragment>
    );
}
