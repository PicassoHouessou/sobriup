import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AUTHOR } from '@Admin/config';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <div className="main-footer">
            <span>&copy; 2024. {AUTHOR.FULL_NAME}. All Rights Reserved.</span>
            <span>
                {t('Créé par :')}{' '}
                <Link to={AUTHOR.WEBSITE} target="_blank">
                    {AUTHOR.FULL_NAME}
                </Link>
            </span>
        </div>
    );
}
