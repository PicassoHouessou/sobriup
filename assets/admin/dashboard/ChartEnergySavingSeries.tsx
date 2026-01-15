import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card } from 'react-bootstrap';
import { Statistic } from '@Admin/models';
import { Empty } from 'antd';
import apexLocaleEn from 'apexcharts/dist/locales/en.json';
import apexLocaleFr from 'apexcharts/dist/locales/fr.json';
import { useAppSelector } from '@Admin/store/store';
import { selectCurrentLocale } from '@Admin/features/localeSlice';

type Props = {
    data?: Statistic[];
};

const ChartEnergySavings = ({ data }: Props) => {
    const currentLocale = useAppSelector(selectCurrentLocale);
    const series = useMemo(() => {
        const rows = data?.[0]?.charts?.savings;
        //console.log("rows",rows);
        //console.log(rows);
        if (!Array.isArray(rows)) return null;

        return [
            {
                name: 'kg CO₂',
                data: rows?.map((r: any) => r.savingKgCo2),
            },
        ];
    }, [data]);

    const options = {
        chart: {
            locales: [apexLocaleEn, apexLocaleFr],
            defaultLocale: currentLocale,
        },
        xaxis: {
            categories: [data?.[0]?.charts?.savings?.map((r: any) => r.period)],
        },
        tooltip: {
            y: { formatter: (v: number) => `${v.toFixed(1)} kg CO₂` },
        },
    };

    return (
        <Card className="card-one">
            <Card.Header>
                <Card.Title as="h6">Économies CO₂</Card.Title>
            </Card.Header>
            <Card.Body>
                {series ? (
                    <ReactApexChart
                        type="bar"
                        series={series}
                        options={options}
                        height={300}
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Card.Body>
        </Card>
    );
};

export default ChartEnergySavings;
