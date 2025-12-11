<?php

namespace App\Service;

use App\Entity\Module;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use App\Entity\ModuleType;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class StatisticService
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly string $timezone)
    {
    }

    private function calculateIncreaseForThisWeek(string $entityClass): array
    {
        $repository = $this->entityManager->getRepository($entityClass);

        // Calculate date ranges
        $now = new \DateTime('now', new \DateTimeZone($this->timezone));
        $startOfThisWeek = (clone $now)->modify('monday this week')->setTime(0, 0, 0);
        $endOfThisWeek = (clone $startOfThisWeek)->modify('sunday this week')->setTime(23, 59, 59);

        $startOfLastWeek = (clone $startOfThisWeek)->modify('-1 week');
        $endOfLastWeek = (clone $endOfThisWeek)->modify('-1 week');


        // Get entities created in the date ranges
        $thisWeekEntities = $repository->findCreatedBetween($startOfThisWeek, $endOfThisWeek);
        $lastWeekEntities = $repository->findCreatedBetween($startOfLastWeek, $endOfLastWeek);

        // Calculate the counts and increase
        $thisWeekCount = count($thisWeekEntities);
        $lastWeekCount = count($lastWeekEntities);

        $increase = $thisWeekCount - $lastWeekCount;
        $percentageIncrease = $lastWeekCount > 0 ? ($increase / $lastWeekCount) * 100 : ($thisWeekCount > 0 ? 100 : 0);

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
            $summary["percentage"] = round(($countModulesForType * 100) / $countModules, 2);
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
            $summary["percentage"] = round(($countModulesForStatus * 100) / $countModules, 2);
            $charts["summaryStatus"][] = $summary;
        }
        return ($charts);

    }


}
