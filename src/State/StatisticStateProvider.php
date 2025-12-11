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

            $charts = $statisticService->getChartsData();
            $statistic = new Statistic(new \DateTime());
            $statistic->user = array_merge(['total' => $statisticService->total(User::class)], $statisticService->getUserIncreaseForThisWeek());
            $statistic->moduleStatus = array_merge(['total' => $statisticService->total(ModuleStatus::class)], $statisticService->getModuleStatusIncreaseForThisWeek());
            $statistic->moduleType = array_merge(['total' => $statisticService->total(ModuleType::class)], $statisticService->getModuleTypeIncreaseForThisWeek());
            $statistic->moduleHistory = array_merge(['total' => $statisticService->total(ModuleHistory::class)], $statisticService->getModuleHistoryIncreaseForThisWeek());
            $statistic->module = array_merge(['total' => $statisticService->total(Module::class)], $statisticService->getModuleIncreaseForThisWeek());
            $statistic->charts = $charts;
            return array($statistic);
        }
        return null;
    }


}
