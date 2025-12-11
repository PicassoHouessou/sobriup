export interface Statistic {
    date: string; // ISO 8601 format date string
    user: StatisticsDetail;
    moduleStatus: StatisticsDetail;
    moduleType: StatisticsDetail;
    moduleHistory: StatisticsDetail;
    module: StatisticsDetail;
    dateAgo: string; // Human-readable time difference
    charts: any;
}

export interface StatisticsDetail {
    total: number;
    thisWeekCount: number;
    lastWeekCount: number;
    increase: number;
    percentageIncrease: number; // Assuming percentage increase is a floating-point number
}
