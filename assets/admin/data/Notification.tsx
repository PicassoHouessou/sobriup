import React from 'react';
import Img1 from '../assets/img/img10.jpg';

const Notification = [
    {
        avatar: <img src={Img1} alt="" />,
        text: (
            <React.Fragment>
                <strong>Dominador Manuel</strong> and <strong>100 other people</strong>{' '}
                reacted to your comment &apos;Tell your partner that...
            </React.Fragment>
        ),
        date: 'Aug 20 08:55am',
        status: 'online',
    },
];
export default Notification;
