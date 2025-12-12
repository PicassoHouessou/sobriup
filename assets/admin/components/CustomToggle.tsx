import React from 'react';
import { Link } from 'react-router';

export const CustomToggle = React.forwardRef(
    ({ children, onClick }: any, ref: React.ForwardedRef<any>) => (
        <Link
            to=""
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            className="dropdown-link"
        >
            {children}
        </Link>
    ),
);
