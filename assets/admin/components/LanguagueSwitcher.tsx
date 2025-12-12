import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultLocale, Language, lngs, Locale } from '@Admin/config/language';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router';
import { setLocale } from '@Admin/features/localeSlice';
import { useAppDispatch } from '@Admin/store/store';

type Props = Record<string, never>;

export default function LanguageSwitcher({}: Props) {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();

    const [currentLanguage, setCurrentLanguage] = useState<Language>({
        nativeName: lngs[i18n.resolvedLanguage as keyof typeof lngs]?.nativeName,
        image: lngs[i18n.resolvedLanguage as keyof typeof lngs]?.image,
    });

    React.useEffect(() => {
        if (!(currentLanguage.nativeName || currentLanguage.image)) {
            const current = i18n.language ?? defaultLocale;
            setCurrentLanguage({
                nativeName: lngs[current as keyof typeof lngs]?.nativeName,
                image: lngs[current as keyof typeof lngs]?.image,
            });
            dispatch(setLocale(current as Locale));
        }
    }, [i18n.language,currentLanguage,dispatch]);

    const changeLanguageAction = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        lng: string,
    ) => {
        e.preventDefault();
        i18n.changeLanguage(lng);
        setCurrentLanguage({
            nativeName: lngs[lng as keyof typeof lngs]?.nativeName,
            image: lngs[lng as keyof typeof lngs]?.image,
        });
        dispatch(setLocale(lng as Locale));

        document.documentElement.setAttribute(
            'lang',
            lngs[lng as keyof typeof lngs]?.nativeName,
        );
    };
    const CustomToggle = React.forwardRef(
        (
            {
                children,
                onClick,
            }: {
                children: React.ReactNode;
                onClick: any;
            },
            ref: any,
        ) => (
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

    return (
        <Dropdown className="dropdown-skin ms-3 ms-xl-4" align="end">
            <Dropdown.Toggle as={CustomToggle}>
                <img
                    className=""
                    src={currentLanguage?.image}
                    alt={currentLanguage?.nativeName}
                    height="16"
                />
            </Dropdown.Toggle>
            <Dropdown.Menu className="mt-10-f">
                <label>{t('Choisir votre langue')}</label>
                <nav className="nav nav-skin">
                    {Object.keys(lngs).map((lng, key) => (
                        <Link
                            key={key}
                            to=""
                            onClick={(e) => changeLanguageAction(e, lng)}
                            className={
                                currentLanguage.nativeName ===
                                lngs[lng as keyof typeof lngs]?.nativeName
                                    ? 'nav-link active'
                                    : 'nav-link'
                            }
                        >
                            <img
                                src={lngs[lng as keyof typeof lngs]?.image}
                                alt={lngs[lng as keyof typeof lngs]?.nativeName}
                                className=""
                                height="12"
                            />{' '}
                            {lngs[lng as keyof typeof lngs]?.nativeName}
                        </Link>
                    ))}
                </nav>
            </Dropdown.Menu>
        </Dropdown>
    );
}
