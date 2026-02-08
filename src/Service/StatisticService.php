<?php

namespace App\Service;

use App\Entity\Module;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use App\Entity\ModuleType;
use App\Entity\Zone;
use App\Repository\ModuleHistoryRepository;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class StatisticService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly string $timezone
    ) {
    }

    private function calculateIncreaseForThisWeek(string $entityClass): array
    {
        $repository = $this->entityManager->getRepository($entityClass);

        $now = new \DateTime('now', new \DateTimeZone($this->timezone));
        $startOfThisWeek = (clone $now)->modify('monday this week')->setTime(0, 0, 0);
        $endOfThisWeek = (clone $startOfThisWeek)->modify('sunday this week')->setTime(23, 59, 59);

        $startOfLastWeek = (clone $startOfThisWeek)->modify('-1 week');
        $endOfLastWeek = (clone $endOfThisWeek)->modify('-1 week');

        $thisWeekEntities = $repository->findCreatedBetween($startOfThisWeek, $endOfThisWeek);
        $lastWeekEntities = $repository->findCreatedBetween($startOfLastWeek, $endOfLastWeek);

        $thisWeekCount = count($thisWeekEntities);
        $lastWeekCount = count($lastWeekEntities);

        $increase = $thisWeekCount - $lastWeekCount;
        $percentageIncrease = $lastWeekCount > 0
            ? ($increase / $lastWeekCount) * 100
            : ($thisWeekCount > 0 ? 100 : 0);

        return [
            'thisWeekCount' => $thisWeekCount,
            'lastWeekCount' => $lastWeekCount,
            'increase' => $increase,
            'percentageIncrease' => round(abs($percentageIncrease), 2)
        ];
    }

    public function getUserIncreaseForThisWeek(): array
    {
        return $this->calculateIncreaseForThisWeek(User::class);
    }

    public function getModuleHistoryIncreaseForThisWeek(): array
    {
        return $this->calculateIncreaseForThisWeek(ModuleHistory::class);
    }

    public function getModuleStatusIncreaseForThisWeek(): array
    {
        return $this->calculateIncreaseForThisWeek(ModuleStatus::class);
    }

    public function getModuleIncreaseForThisWeek(): array
    {
        return $this->calculateIncreaseForThisWeek(Module::class);
    }

    public function getModuleTypeIncreaseForThisWeek(): array
    {
        return $this->calculateIncreaseForThisWeek(ModuleType::class);
    }

    public function total(string $entityClass)
    {
        return $this->entityManager->getRepository($entityClass)->count();
    }

    public function getChartsData(): array
    {
        $moduleTypeRepository = $this->entityManager->getRepository(ModuleType::class);
        $moduleHistoryRepository = $this->entityManager->getRepository(ModuleHistory::class);
        $moduleRepository = $this->entityManager->getRepository(Module::class);
        $moduleStatusRepository = $this->entityManager->getRepository(ModuleStatus::class);
        $moduleTypes = $moduleTypeRepository->findAll();
        $moduleStatuses = $moduleStatusRepository->findAll();
        $countModules = $moduleRepository->count();
        $countModuleTypes = $moduleTypeRepository->count();

        $charts = [];

        foreach ($moduleTypes as $moduleType) {
            $summary = array();
            $type = $moduleType->getName();
            $summary["type"] = $type;
            $countModulesForType = $moduleRepository->countForType($moduleType);
            $summary["count"] = $countModulesForType;
            $summary["percentage"] = round(($countModulesForType * 100) / max($countModules, 1), 2);
            $charts["summaryType"][] = $summary;
            $charts["summaryModule12Months"][] = array_merge(["type" => $type], $moduleRepository->countForLast12Months($moduleType));
            $charts["summaryModule7days"][] = array_merge(["type" => $type], $moduleRepository->countForLast7Days($moduleType));
        }

        foreach ($moduleStatuses as $moduleStatus) {
            $summary = array();
            $name = $moduleStatus->getName();
            $summary["name"] = $name;
            $summary["color"] = $moduleStatus->getColor();
            $countModulesForStatus = $moduleHistoryRepository->countLatestHistoryForEachModuleNativeSQL($moduleStatus);
            $summary["count"] = $countModulesForStatus;
            $summary["percentage"] = round(($countModulesForStatus * 100) / max($countModules, 1), 2);
            $charts["summaryStatus"][] = $summary;
        }

        return $charts;
    }

    /**
     *  Chart température (sans filtres)
     */
    public function getTemperatureChart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'day'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getTemperatureSeries($from, $to, $groupBy);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'measured' => array_column($data, 'measured'),
                'target' => array_column($data, 'target'),
            ],
        ];
    }

    /**
     *  Chart énergie (sans filtres)
     */
    public function getEnergyChart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'day'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeries($from, $to, $groupBy);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'kwh' => array_column($data, 'kwh'),
            ],
        ];
    }

    /**
     *  Graphique CO2 (sans filtres)
     */
    public function getCO2Chart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'year'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeries($from, $to, $groupBy);

        $CO2_FACTOR = 0.204;
        $before = [];
        $after = [];
        $labels = [];
        $totalSaved = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $co2 = ($row['kwh'] * $CO2_FACTOR) / 1000;

            $labels[] = $row['label'];

            if ($year < 2024) {
                $before[] = round($co2, 1);
                $after[] = 0;
            } else {
                $estimatedBefore = round($co2 / 0.78, 1);
                //$before[] = $estimatedBefore;
                $after[] = round($co2, 1);
                $totalSaved += ($estimatedBefore - $co2);
            }
        }

        return [
            'labels' => $labels,
            'series' => [
                'before' => $before,
                'after' => $after,
            ],
            'totalSaved' => round($totalSaved, 1),
        ];
    }

    /**
     *  Graphique coûts financiers (sans filtres)
     */
    public function getFinancialCostChart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'year'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeries($from, $to, $groupBy);

        $COST_PER_KWH = 0.09;
        $costSeries = [];
        $labels = [];
        $totalSavings = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $cost = $row['kwh'] * $COST_PER_KWH;

            $labels[] = $row['label'];
            $costSeries[] = round($cost, 0);

            if ($year >= 2024) {
                $estimatedCostBefore = $cost / 0.78;
                $totalSavings += ($estimatedCostBefore - $cost);
            }
        }

        $annualSavings = $totalSavings / max(1, count(array_filter($labels, fn($l) => (int)explode('-', $l)[0] >= 2024)));

        $investment = 12400;
        $roi = $annualSavings > 0 ? round(($investment / $annualSavings) * 12, 0) : 0;

        return [
            'labels' => $labels,
            'series' => [
                'cost' => $costSeries,
            ],
            'annualSavings' => round($annualSavings, 0),
            'totalSavings' => round($totalSavings, 0),
            'roi' => $roi,
        ];
    }

    /**
     *  Performance par zone
     */
    public function getPerformanceByZone(
        \DateTimeInterface $beforeStart,
        \DateTimeInterface $beforeEnd,
        \DateTimeInterface $afterStart,
        \DateTimeInterface $afterEnd
    ): array {
        $conn = $this->entityManager->getConnection();

        // Consommation AVANT (2023) - NORMALISÉE par jour
        $beforeQuery = "
            SELECT
                z.name as zone_name,
                SUM(mh.energy_consumption) as total_energy,
                DATEDIFF(:before_end, :before_start) as nb_days
            FROM module_history mh
            JOIN module m ON mh.module_id = m.id
            JOIN space s ON m.space_id = s.id
            JOIN zone z ON s.zone_id = z.id
            WHERE mh.created_at BETWEEN :before_start AND :before_end
            GROUP BY z.id, z.name
            ORDER BY z.name
        ";

        $beforeData = $conn->executeQuery($beforeQuery, [
            'before_start' => $beforeStart->format('Y-m-d'),
            'before_end' => $beforeEnd->format('Y-m-d'),
        ])->fetchAllAssociative();

        // Consommation APRÈS (2024-2025) - NORMALISÉE par jour
        $afterQuery = "
            SELECT
                z.name as zone_name,
                SUM(mh.energy_consumption) as total_energy,
                DATEDIFF(:after_end, :after_start) as nb_days
            FROM module_history mh
            JOIN module m ON mh.module_id = m.id
            JOIN space s ON m.space_id = s.id
            JOIN zone z ON s.zone_id = z.id
            WHERE mh.created_at BETWEEN :after_start AND :after_end
            GROUP BY z.id, z.name
            ORDER BY z.name
        ";

        $afterData = $conn->executeQuery($afterQuery, [
            'after_start' => $afterStart->format('Y-m-d'),
            'after_end' => $afterEnd->format('Y-m-d'),
        ])->fetchAllAssociative();

        // ✅ CORRECTION : Normalisation sur 365 jours
        $zones = [];
        $labels = [];
        $beforeValues = [];
        $afterValues = [];
        $details = [];

        foreach ($beforeData as $before) {
            $zoneName = $before['zone_name'];
            $nbDays = max(1, (int) $before['nb_days']);
            $energyPerDay = (float) $before['total_energy'] / $nbDays;
            $energy365 = $energyPerDay * 365; // Projection annuelle

            $zones[$zoneName] = [
                'name' => $zoneName,
                'before' => $energy365,
                'after' => 0,
            ];
        }

        foreach ($afterData as $after) {
            $zoneName = $after['zone_name'];
            $nbDays = max(1, (int) $after['nb_days']);
            $energyPerDay = (float) $after['total_energy'] / $nbDays;
            $energy365 = $energyPerDay * 365; // Projection annuelle

            if (isset($zones[$zoneName])) {
                $zones[$zoneName]['after'] = $energy365;
            } else {
                $zones[$zoneName] = [
                    'name' => $zoneName,
                    'before' => 0,
                    'after' => $energy365,
                ];
            }
        }

        foreach ($zones as $zone) {
            $labels[] = $zone['name'];
            $beforeVal = round($zone['before'], 0);
            $afterVal = round($zone['after'], 0);

            $beforeValues[] = $beforeVal;
            $afterValues[] = $afterVal;

            // ✅ GAIN POSITIF = baseline - optimized
            $gain = $zone['before'] > 0
                ? round((($zone['before'] - $zone['after']) / $zone['before']) * 100, 1)
                : 0;

            $details[] = [
                'name' => $zone['name'],
                'before' => $beforeVal,
                'after' => $afterVal,
                'gainPercent' => $gain,
            ];
        }

        return [
            'labels' => $labels,
            'series' => [
                'before' => $beforeValues,
                'after' => $afterValues,
            ],
            'details' => $details,
        ];
    }

    /**
     *  Calcul des gains
     */
    public function getSavingsChart(
        \DateTimeInterface $baselineFrom,
        \DateTimeInterface $baselineTo,
        \DateTimeInterface $currentFrom,
        \DateTimeInterface $currentTo
    ): array {
        $repo = $this->entityManager->getRepository(ModuleHistory::class);

        $baseline = $repo->sumEnergy($baselineFrom, $baselineTo);
        $current = $repo->sumEnergy($currentFrom, $currentTo);

        $baselineDays = $baselineFrom->diff($baselineTo)->days ?: 1;
        $currentDays = $currentFrom->diff($currentTo)->days ?: 1;

        $baselinePerDay = $baseline / $baselineDays;
        $currentPerDay = $current / $currentDays;

        $baseline30 = $baselinePerDay * 30;
        $current30 = $currentPerDay * 30;

        $gain = max(0, $baseline30 - $current30);
        $gainPercent = $baseline30 > 0 ? round(($gain / $baseline30) * 100, 1) : 0;

        return [
            'baseline_kwh' => round($baseline30, 1),
            'optimized_kwh' => round($current30, 1),
            'gain_kwh' => round($gain, 1),
            'gain_percent' => $gainPercent,
        ];
    }

    /**
     *  Graphique température avec filtres (accepte Zone entity)
     */
    public function getTemperatureChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'day',
        ?Zone $zone = null
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getTemperatureSeriesByZone($from, $to, $period, $zone);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'measured' => array_column($data, 'measured'),
                'target' => array_column($data, 'target'),
            ],
            'zone' => $zone ? $zone->getName() : 'all',
            'period' => $period,
        ];
    }

    /**
     *  Graphique énergie avec filtres (accepte Zone entity)
     */
    public function getEnergyChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'month',
        ?Zone $zone = null
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeriesByZone($from, $to, $period, $zone);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'kwh' => array_column($data, 'kwh'),
            ],
            'zone' => $zone ? $zone->getName() : 'all',
            'period' => $period,
        ];
    }

    /**
     *  Graphique CO2 avec filtres (accepte Zone entity)
     */
    public function getCO2ChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'year',
        ?Zone $zone = null
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeriesByZone($from, $to, $period, $zone);

        $CO2_FACTOR = 0.204;
        $before = [];
        $after = [];
        $labels = [];
        $totalSaved = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $co2 = ($row['kwh'] * $CO2_FACTOR) / 1000;

            $labels[] = $row['label'];

            if ($year < 2024) {
                $before[] = round($co2, 1);
                $after[] = 0;
            } else {
                $estimatedBefore = round($co2 / 0.78, 1);
                $before[] = $estimatedBefore;
                $after[] = round($co2, 1);
                $totalSaved += ($estimatedBefore - $co2);
            }
        }

        return [
            'labels' => $labels,
            'series' => [
                'before' => $before,
                'after' => $after,
            ],
            'totalSaved' => round($totalSaved, 1),
            'zone' => $zone ? $zone->getName() : 'all',
            'period' => $period,
        ];
    }

    /**
     *  Graphique coûts avec filtres (accepte Zone entity)
     */
    public function getFinancialCostChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'month',
        ?Zone $zone = null
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeriesByZone($from, $to, $period, $zone);

        $COST_PER_KWH = 0.09;
        $costSeries = [];
        $labels = [];
        $totalSavings = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $cost = $row['kwh'] * $COST_PER_KWH;

            $labels[] = $row['label'];
            $costSeries[] = round($cost, 0);

            if ($year >= 2024) {
                $estimatedCostBefore = $cost / 0.78;
                $totalSavings += ($estimatedCostBefore - $cost);
            }
        }

        $yearsAfter2024 = count(array_filter($labels, fn($l) => (int)explode('-', $l)[0] >= 2024));
        $annualSavings = $yearsAfter2024 > 0 ? $totalSavings / $yearsAfter2024 : 0;

        $investment = 12400;
        $roi = $annualSavings > 0 ? round(($investment / $annualSavings) * 12, 0) : 0;

        return [
            'labels' => $labels,
            'series' => [
                'cost' => $costSeries,
            ],
            'annualSavings' => round($annualSavings, 0),
            'totalSavings' => round($totalSavings, 0),
            'roi' => $roi,
            'zone' => $zone ? $zone->getName() : 'all',
            'period' => $period,
        ];
    }

    /**
     *  Liste des zones disponibles
     */
    public function getAvailableZones(): array
    {
        return $this->entityManager->getRepository(ModuleHistory::class)
            ->getAvailableZones();
    }
}
