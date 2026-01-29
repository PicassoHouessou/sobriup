<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Statistic;
use App\Entity\Module;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use App\Entity\ModuleType;
use App\Entity\User;
use App\Service\StatisticService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * @implements ProviderInterface<Statistic[]|Statistic|null>
 */
class StatisticStateProviderNew implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $manager,
        private StatisticService       $statisticService,
        private RequestStack          $requestStack
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $statisticService = $this->statisticService;

        if ($operation instanceof CollectionOperationInterface) {
            // ✅ Récupération des paramètres de requête
            $request = $this->requestStack->getCurrentRequest();
            $zone = $request?->query->get('zone'); // null | 'restaurant' | 'logement' | 'all'
            $period = $request?->query->get('period', 'year'); // 'day' | 'week' | 'month' | 'year'

            $statistic = new Statistic(new \DateTime());

            // KPIs de base
            $statistic->user = array_merge(
                ['total' => $statisticService->total(User::class)],
                $statisticService->getUserIncreaseForThisWeek()
            );
            $statistic->moduleStatus = array_merge(
                ['total' => $statisticService->total(ModuleStatus::class)],
                $statisticService->getModuleStatusIncreaseForThisWeek()
            );
            $statistic->moduleType = array_merge(
                ['total' => $statisticService->total(ModuleType::class)],
                $statisticService->getModuleTypeIncreaseForThisWeek()
            );
            $statistic->moduleHistory = array_merge(
                ['total' => $statisticService->total(ModuleHistory::class)],
                $statisticService->getModuleHistoryIncreaseForThisWeek()
            );
            $statistic->module = array_merge(
                ['total' => $statisticService->total(Module::class)],
                $statisticService->getModuleIncreaseForThisWeek()
            );

            /* CHARTS STRUCTURELS */
            $charts = $this->statisticService->getChartsData();

            $now = new \DateTimeImmutable();
            $startSimulation = $now->modify('-5 years'); // 2021

            /* ✅ GRAPHIQUES AVEC FILTRES */

            // Normalisation du nom de zone
            $zoneName = null;
            if ($zone && $zone !== 'all') {
                $zoneName = match(strtolower($zone)) {
                    'restaurant' => 'Restaurant universitaire',
                    'logement' => 'Logement universitaire',
                    default => null,
                };
            }

            // Température (avec filtres)
            $from30days = $now->modify('-30 days');
            if ($zoneName || $period !== 'day') {
                $charts['temperature'] = $this->statisticService->getTemperatureChartFiltered(
                    $from30days,
                    $now,
                    $period,
                    $zoneName
                );
            } else {
                $charts['temperature'] = $this->statisticService->getTemperatureChart(
                    $from30days,
                    $now,
                    'day'
                );
            }

            // Énergie (avec filtres)
            if ($zoneName || $period !== 'year') {
                $charts['energy'] = $this->statisticService->getEnergyChartFiltered(
                    $startSimulation,
                    $now,
                    $period,
                    $zoneName
                );
            } else {
                $charts['energy'] = $this->statisticService->getEnergyChart(
                    $startSimulation,
                    $now,
                    'year'
                );
            }

            /* GRAPHIQUE GAINS (30 derniers jours vs même période l'an dernier) */
            $charts['savings'] = $this->statisticService->getSavingsChart(
                $now->modify('-1 year -30 days'),
                $now->modify('-1 year'),
                $from30days,
                $now
            );

            /* ✅ NOUVEAUX GRAPHIQUES AVEC FILTRES */

            // 1. CO2 (avec filtres)
            if ($zoneName || $period !== 'year') {
                $charts['co2'] = $this->statisticService->getCO2ChartFiltered(
                    $startSimulation,
                    $now,
                    $period,
                    $zoneName
                );
            } else {
                $charts['co2'] = $this->statisticService->getCO2Chart(
                    $startSimulation,
                    $now,
                    'year'
                );
            }

            // 2. Coûts financiers (avec filtres)
            if ($zoneName || $period !== 'year') {
                $charts['cost'] = $this->statisticService->getFinancialCostChartFiltered(
                    $startSimulation,
                    $now,
                    $period,
                    $zoneName
                );
            } else {
                $charts['cost'] = $this->statisticService->getFinancialCostChart(
                    $startSimulation,
                    $now,
                    'year'
                );
            }

            // 3. Performance par zone (avant: 2023, après: 2024-2025)
            $charts['performanceByZone'] = $this->statisticService->getPerformanceByZone(
                new \DateTimeImmutable('2023-01-01'),
                new \DateTimeImmutable('2023-12-31'),
                new \DateTimeImmutable('2024-01-01'),
                $now
            );

            // 4. Zones disponibles
            $charts['availableZones'] = $this->statisticService->getAvailableZones();

            $statistic->charts = $charts;

            return array($statistic);
        }

        return null;
    }
}
