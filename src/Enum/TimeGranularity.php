<?php

namespace App\Enum;
enum TimeGranularity: string
{
    case DAY = 'day';
    case MONTH = 'month';
    case QUARTER = 'quarter';
    case SEMESTER = 'semester';
    case YEAR = 'year';
}
