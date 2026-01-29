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
     * ✅ CORRIGÉ : Chart température
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
     * ✅ CORRIGÉ : Chart énergie
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
     * ✅ NOUVEAU : Graphique CO2
     */
    public function getCO2Chart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'year'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeries($from, $to, $groupBy);

        $CO2_FACTOR = 0.204; // kgCO2 / kWh pour le gaz naturel (France)

        $before = [];
        $after = [];
        $labels = [];
        $totalSaved = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $co2 = ($row['kwh'] * $CO2_FACTOR) / 1000; // Conversion en tonnes

            $labels[] = $row['label'];

            if ($year < 2024) {
                $before[] = round($co2, 1);
                $after[] = 0;
            } else {
                // Estimation "avant" pour comparaison
                $estimatedBefore = round($co2 / 0.78, 1); // Inverse du facteur 0.78
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
        ];
    }

    /**
     * ✅ NOUVEAU : Graphique coûts financiers
     */
    public function getFinancialCostChart(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $groupBy = 'year'
    ): array {
        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeries($from, $to, $groupBy);

        $COST_PER_KWH = 0.09; // €/kWh (moyenne gaz France)

        $costSeries = [];
        $labels = [];
        $totalSavings = 0;
        $baselineCost = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $cost = $row['kwh'] * $COST_PER_KWH;

            $labels[] = $row['label'];
            $costSeries[] = round($cost, 0);

            if ($year === 2023) {
                $baselineCost = $cost;
            }

            if ($year >= 2024) {
                // Estimation du coût "avant" pour calculer les économies
                $estimatedCostBefore = $cost / 0.78;
                $totalSavings += ($estimatedCostBefore - $cost);
            }
        }

        $annualSavings = $totalSavings / max(1, count(array_filter($labels, fn($l) => (int)explode('-', $l)[0] >= 2024)));

        // ROI basé sur investissement de 12 400€ (voir présentation)
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
     * ✅ NOUVEAU : Performance par zone
     */
    public function getPerformanceByZone(
        \DateTimeInterface $beforeStart,
        \DateTimeInterface $beforeEnd,
        \DateTimeInterface $afterStart,
        \DateTimeInterface $afterEnd
    ): array {
        $conn = $this->entityManager->getConnection();

        // Consommation AVANT (2023)
        $beforeQuery = "
            SELECT
                z.name as zone_name,
                SUM(mh.energy_consumption) as total_energy
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

        // Consommation APRÈS (2024-2025)
        $afterQuery = "
            SELECT
                z.name as zone_name,
                SUM(mh.energy_consumption) as total_energy
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

        // Fusion des données
        $zones = [];
        $labels = [];
        $beforeValues = [];
        $afterValues = [];
        $details = [];

        foreach ($beforeData as $before) {
            $zoneName = $before['zone_name'];
            $zones[$zoneName] = [
                'name' => $zoneName,
                'before' => (float) $before['total_energy'],
                'after' => 0,
            ];
        }

        foreach ($afterData as $after) {
            $zoneName = $after['zone_name'];
            if (isset($zones[$zoneName])) {
                $zones[$zoneName]['after'] = (float) $after['total_energy'];
            } else {
                $zones[$zoneName] = [
                    'name' => $zoneName,
                    'before' => 0,
                    'after' => (float) $after['total_energy'],
                ];
            }
        }

        foreach ($zones as $zone) {
            $labels[] = $zone['name'];
            $beforeValues[] = round($zone['before'], 0);
            $afterValues[] = round($zone['after'], 0);

            $gain = $zone['before'] > 0
                ? round((($zone['before'] - $zone['after']) / $zone['before']) * 100, 1)
                : 0;

            $details[] = [
                'name' => $zone['name'],
                'before' => round($zone['before'], 0),
                'after' => round($zone['after'], 0),
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
     * ✅ Calcul des gains (baseline DOIT être > optimized)
     */
    public function getSavingsChart(
        \DateTimeInterface $baselineFrom,
        \DateTimeInterface $baselineTo,
        \DateTimeInterface $currentFrom,
        \DateTimeInterface $currentTo
    ): array {
        $repo = $this->entityManager->getRepository(ModuleHistory::class);

        // Baseline = période de référence (ancienne)
        $baseline = $repo->sumEnergy($baselineFrom, $baselineTo);

        // Current = période actuelle (après optimisation)
        $current = $repo->sumEnergy($currentFrom, $currentTo);

        // ✅ CORRECTION : On normalise sur la même durée
        $baselineDays = $baselineFrom->diff($baselineTo)->days ?: 1;
        $currentDays = $currentFrom->diff($currentTo)->days ?: 1;

        // Normalisation : kWh par jour
        $baselinePerDay = $baseline / $baselineDays;
        $currentPerDay = $current / $currentDays;

        // Projection sur 30 jours pour comparaison
        $baseline30 = $baselinePerDay * 30;
        $current30 = $currentPerDay * 30;

        // Le gain = ce qu'on économise (baseline - current)
        $gain = max(0, $baseline30 - $current30);
        $gainPercent = $baseline30 > 0 ? round(($gain / $baseline30) * 100, 1) : 0;

        return [
            'baseline_kwh' => round($baseline30, 1),      // Consommation de référence
            'optimized_kwh' => round($current30, 1),      // Consommation actuelle
            'gain_kwh' => round($gain, 1),                // Économie
            'gain_percent' => $gainPercent,               // % d'économie
        ];
    }


    /**
     * ✅ Graphique température avec filtres
     */
    public function getTemperatureChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'day',
        ?string $zoneName = null
    ): array {
        $zone = $zoneName
            ? $this->entityManager->getRepository(Zone::class)->findOneBy(['name' => $zoneName])
            : null;

        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getTemperatureSeriesByZone($from, $to, $period, $zone);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'measured' => array_column($data, 'measured'),
                'target' => array_column($data, 'target'),
            ],
            'zone' => $zoneName ?? 'all',
            'period' => $period,
        ];
    }

    /**
     * ✅ Graphique énergie avec filtres
     */
    public function getEnergyChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'month',
        ?string $zoneName = null
    ): array {
        $zone = $zoneName
            ? $this->entityManager->getRepository(Zone::class)->findOneBy(['name' => $zoneName])
            : null;

        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeriesByZone($from, $to, $period, $zone);

        return [
            'labels' => array_column($data, 'label'),
            'series' => [
                'kwh' => array_column($data, 'kwh'),
            ],
            'zone' => $zoneName ?? 'all',
            'period' => $period,
        ];
    }

    /**
     * ✅ Graphique CO2 avec filtres
     */
    public function getCO2ChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'year',
        ?string $zoneName = null
    ): array {
        $zone = $zoneName
            ? $this->entityManager->getRepository(Zone::class)->findOneBy(['name' => $zoneName])
            : null;

        $data = $this->entityManager->getRepository(ModuleHistory::class)
            ->getEnergySeriesByZone($from, $to, $period, $zone);

        $CO2_FACTOR = 0.204; // kgCO2 / kWh
        $before = [];
        $after = [];
        $labels = [];
        $totalSaved = 0;

        foreach ($data as $row) {
            $year = (int) explode('-', $row['label'])[0];
            $co2 = ($row['kwh'] * $CO2_FACTOR) / 1000; // tonnes

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
            'zone' => $zoneName ?? 'all',
            'period' => $period,
        ];
    }

    /**
     * ✅ Graphique coûts avec filtres
     */
    public function getFinancialCostChartFiltered(
        \DateTimeInterface $from,
        \DateTimeInterface $to,
        string $period = 'month',
        ?string $zoneName = null
    ): array {
        $zone = $zoneName
            ? $this->entityManager->getRepository(Zone::class)->findOneBy(['name' => $zoneName])
            : null;

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
            'zone' => $zoneName ?? 'all',
            'period' => $period,
        ];
    }

    /**
     * ✅ Liste des zones disponibles
     */
    public function getAvailableZones(): array
    {
        return $this->entityManager->getRepository(ModuleHistory::class)
            ->getAvailableZones();
    }
}
