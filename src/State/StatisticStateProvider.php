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

/**
 * @implements ProviderInterface<Statistic[]|Statistic|null>
 */
class StatisticStateProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $manager,
        private StatisticService       $statisticService
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $statisticService = $this->statisticService;

        if ($operation instanceof CollectionOperationInterface) {
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

            /* GRAPHIQUES TEMPÉRATURE & ÉNERGIE */
            $from30days = $now->modify('-30 days');
            $charts['temperature'] = $this->statisticService->getTemperatureChart($from30days, $now, 'day');
            $charts['energy'] = $this->statisticService->getEnergyChart($startSimulation, $now, 'year');

            /* GRAPHIQUE GAINS (30 derniers jours vs même période l'an dernier) */
            $charts['savings'] = $this->statisticService->getSavingsChart(
                $now->modify('-1 year -30 days'),
                $now->modify('-1 year'),
                $from30days,
                $now
            );

            /* ✅ NOUVEAUX GRAPHIQUES */

            // 1. CO2 (années)
            $charts['co2'] = $this->statisticService->getCO2Chart($startSimulation, $now, 'year');

            // 2. Coûts financiers (années)
            $charts['cost'] = $this->statisticService->getFinancialCostChart($startSimulation, $now, 'year');

            // 3. Performance par zone (avant: 2023, après: 2024-2025)
            $charts['performanceByZone'] = $this->statisticService->getPerformanceByZone(
                new \DateTimeImmutable('2023-01-01'),
                new \DateTimeImmutable('2023-12-31'),
                new \DateTimeImmutable('2024-01-01'),
                $now
            );

            $statistic->charts = $charts;

            return array($statistic);
        }

        return null;
    }
}
