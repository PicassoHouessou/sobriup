<?php

namespace App\Repository;

use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use App\Entity\Zone;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ModuleHistory>
 *
 * @method ModuleHistory|null find($id, $lockMode = null, $lockVersion = null)
 * @method ModuleHistory|null findOneBy(array $criteria, array $orderBy = null)
 * @method ModuleHistory[]    findAll()
 * @method ModuleHistory[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ModuleHistoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ModuleHistory::class);
    }

    public function findCreatedBetween(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        return $qb->getQuery()->getResult();
    }

    public function total(): int
    {
        return $this->countForStatus();
    }

    public function countForStatus(?ModuleStatus $status = null): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)');
        if ($status) {
            $query->andWhere('u.status = :status')
                ->setParameter('status', $status);
        }
        $result = $query->getQuery()
            ->getSingleScalarResult();
        return $result;
    }

    public function countLatestHistoryForEachModule(?ModuleStatus $status = null): int
    {
        $entityManager = $this->getEntityManager();

        // Step 1: Get the latest `createdAt` for each module
        $subQuery = $entityManager->createQueryBuilder()
            ->select('IDENTITY(mh.module) as module_id, MAX(mh.createdAt) as max_created_at')
            ->from(ModuleHistory::class, 'mh')
            ->groupBy('mh.module')
            ->getQuery()
            ->getResult();

        // Extract module IDs and max createdAt times
        $latestEntries = [];
        foreach ($subQuery as $row) {
            $latestEntries[] = ['module_id' => $row['module_id'], 'max_created_at' => $row['max_created_at']];
        }

        // Step 2: Count the distinct modules with the latest entries
        if (empty($latestEntries)) {
            return 0;
        }

        $qb = $entityManager->createQueryBuilder();
        $qb->select('COUNT(DISTINCT mh.module)')
            ->from(ModuleHistory::class, 'mh');

        $orX = $qb->expr()->orX();
        foreach ($latestEntries as $entry) {
            $orX->add(
                $qb->expr()->andX(
                    $qb->expr()->eq('mh.module', ':module_id_' . $entry['module_id']),
                    $qb->expr()->eq('mh.createdAt', ':max_created_at_' . $entry['module_id'])
                )
            );
            $qb->setParameter('module_id_' . $entry['module_id'], $entry['module_id']);
            $qb->setParameter('max_created_at_' . $entry['module_id'], $entry['max_created_at']);
        }
        $qb->where($orX);

        if ($status instanceof ModuleStatus) {
            $qb->andWhere('mh.status = :status')
                ->setParameter('status', $status);
        }

        return (int)$qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @see countLatestHistoryForEachModule
     * Even countLatestHistoryForEachModule method is complex we prefer it to this method because we don't want to rely on specific SGBD
     */
    public function countLatestHistoryForEachModuleNativeSQL(?ModuleStatus $status = null): int
    {
        $sql = "
            SELECT COUNT(DISTINCT mh.module_id) as module_count
            FROM module_history mh
            INNER JOIN (
                SELECT module_id, MAX(created_at) as max_created_at
                FROM module_history
                GROUP BY module_id
            ) latest
            ON mh.module_id = latest.module_id AND mh.created_at = latest.max_created_at
        ";

        if ($status instanceof ModuleStatus) {
            $id = $status->getId();
            $sql .= " AND mh.status_id = " . $id;
        }
        $connection = $this->getEntityManager()->getConnection();
        $stmt = $connection->prepare($sql);
        $result = $stmt->executeQuery()->fetchOne();

        return (int)$result;
    }
    /**
     * ✅ CORRIGÉ : Somme d'énergie sur une période
     */
    public function sumEnergy(
        \DateTimeInterface $start,
        \DateTimeInterface $end
    ): float {
        $result = $this->createQueryBuilder('mh')
            ->select('COALESCE(SUM(mh.energyConsumption), 0)')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.energyConsumption IS NOT NULL')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getSingleScalarResult();

        return (float) $result;
    }

    /**
     * ✅ CORRIGÉ : Série temporelle de consommation énergétique
     */
    public function getEnergySeries(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        string $period = 'month'
    ): array {
        $groupExpr = $this->getDateGroupExpression('mh.createdAt', $period);

        $results = $this->createQueryBuilder('mh')
            ->select(sprintf('%s AS label', $groupExpr))
            ->addSelect('COALESCE(SUM(mh.energyConsumption), 0) AS kwh')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.energyConsumption IS NOT NULL')
            ->groupBy('label')
            ->orderBy('label', 'ASC')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getArrayResult();

        // ✅ S'assurer que les valeurs sont numériques
        return array_map(function($row) {
            return [
                'label' => $row['label'],
                'kwh' => round((float) $row['kwh'],2)
            ];
        }, $results);
    }

    /**
     * ✅ CORRIGÉ : Série temporelle des températures (mesurée vs cible)
     */
    public function getTemperatureSeries(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        string $period = 'month'
    ): array {
        $groupExpr = $this->getDateGroupExpression('mh.createdAt', $period);

        $results = $this->createQueryBuilder('mh')
            ->select(sprintf('%s AS label', $groupExpr))
            ->addSelect('AVG(mh.measuredTemperature) AS measured')
            ->addSelect('AVG(mh.targetTemperature) AS target')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.measuredTemperature IS NOT NULL')
            ->andWhere('mh.targetTemperature IS NOT NULL')
            ->groupBy('label')
            ->orderBy('label', 'ASC')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getArrayResult();

        // ✅ S'assurer que les valeurs sont numériques
        return array_map(function($row) {
            return [
                'label' => $row['label'],
                'measured' => round((float) $row['measured'], 1),
                'target' => round((float) $row['target'], 1)
            ];
        }, $results);
    }

    /**
     * ✅ NOUVEAU : Série temporelle des gains énergétiques
     */
    public function getSavingsSeries(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        string $period = 'month'
    ): array {
        $groupExpr = $this->getDateGroupExpression('mh.createdAt', $period);

        return $this->createQueryBuilder('mh')
            ->select(sprintf('%s AS period', $groupExpr))
            ->addSelect('SUM(mh.energyConsumption) AS energy')
            ->addSelect('AVG(mh.measuredTemperature / mh.targetTemperature) AS efficiencyRatio')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->groupBy('period')
            ->orderBy('period', 'ASC')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getArrayResult();
    }


    /**
     * ✅ Série temporelle de températures PAR ZONE
     */
    public function getTemperatureSeriesByZone(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        string $period = 'month',
        ?Zone $zone = null
    ): array {
        $groupExpr = $this->getDateGroupExpression('mh.createdAt', $period);

        $qb = $this->createQueryBuilder('mh')
            ->select(sprintf('%s AS label', $groupExpr))
            ->addSelect('AVG(mh.measuredTemperature) AS measured')
            ->addSelect('AVG(mh.targetTemperature) AS target')
            ->innerJoin('mh.module', 'm')
            ->innerJoin('m.space', 's')
            ->innerJoin('s.zone', 'z')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.measuredTemperature IS NOT NULL')
            ->andWhere('mh.targetTemperature IS NOT NULL');

        if ($zone) {
            $qb->andWhere('z = :zone')->setParameter('zone', $zone);
        }

        $results = $qb
            ->groupBy('label')
            ->orderBy('label', 'ASC')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getArrayResult();

        return array_map(function($row) {
            return [
                'label' => $row['label'],
                'measured' => round((float) $row['measured'], 1),
                'target' => round((float) $row['target'], 1)
            ];
        }, $results);
    }

    /**
     * ✅ Série temporelle d'énergie PAR ZONE
     */
    public function getEnergySeriesByZone(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        string $period = 'month',
        ?Zone $zone = null
    ): array {
        $groupExpr = $this->getDateGroupExpression('mh.createdAt', $period);

        $qb = $this->createQueryBuilder('mh')
            ->select(sprintf('%s AS label', $groupExpr))
            ->addSelect('COALESCE(SUM(mh.energyConsumption), 0) AS kwh')
            ->innerJoin('mh.module', 'm')
            ->innerJoin('m.space', 's')
            ->innerJoin('s.zone', 'z')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.energyConsumption IS NOT NULL');

        if ($zone) {
            $qb->andWhere('z = :zone')->setParameter('zone', $zone);
        }

        $results = $qb
            ->groupBy('label')
            ->orderBy('label', 'ASC')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getArrayResult();

        return array_map(function($row) {
            return [
                'label' => $row['label'],
                'kwh' => (float) $row['kwh']
            ];
        }, $results);
    }

    /**
     * ✅ Somme d'énergie PAR ZONE
     */
    public function sumEnergyByZone(
        \DateTimeInterface $start,
        \DateTimeInterface $end,
        ?Zone $zone = null
    ): float {
        $qb = $this->createQueryBuilder('mh')
            ->select('COALESCE(SUM(mh.energyConsumption), 0)')
            ->innerJoin('mh.module', 'm')
            ->innerJoin('m.space', 's')
            ->innerJoin('s.zone', 'z')
            ->where('mh.createdAt BETWEEN :start AND :end')
            ->andWhere('mh.energyConsumption IS NOT NULL');

        if ($zone) {
            $qb->andWhere('z = :zone')->setParameter('zone', $zone);
        }

        return (float) $qb
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * ✅ Toutes les zones disponibles
     */
    public function getAvailableZones(): array
    {
        return $this->createQueryBuilder('mh')
            ->select('DISTINCT z.id, z.name')
            ->innerJoin('mh.module', 'm')
            ->innerJoin('m.space', 's')
            ->innerJoin('s.zone', 'z')
            ->orderBy('z.name', 'ASC')
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Expression DQL portable pour le groupement temporel
     */
    private function getDateGroupExpression(string $field, string $period): string
    {
        return match ($period) {
            'day'       => "DATE($field)",
            'week'      => "CONCAT(YEAR($field), '-W', LPAD(WEEK($field), 2, '0'))",
            'month'     => "CONCAT(YEAR($field), '-', LPAD(MONTH($field), 2, '0'))",
            'quarter'   => "CONCAT(YEAR($field), '-Q', QUARTER($field))",
            'semester'  => "CONCAT(YEAR($field), '-S', CASE WHEN MONTH($field) <= 6 THEN 1 ELSE 2 END)",
            'year'      => "YEAR($field)",
            default     => throw new \InvalidArgumentException("Unsupported period: $period"),
        };
    }


    /**
     * Expression DQL portable pour le groupement temporel
     *//*
    private function getDateGroupExpression(string $field, string $period): string
    {
        return match ($period) {
            'day'       => "DATE($field)",
            'month'     => "CONCAT(YEAR($field), '-', LPAD(MONTH($field), 2, '0'))",
            'quarter'   => "CONCAT(YEAR($field), '-Q', QUARTER($field))",
            'semester'  => "CONCAT(YEAR($field), '-S', CASE WHEN MONTH($field) <= 6 THEN 1 ELSE 2 END)",
            'year'      => "YEAR($field)",
            default     => throw new \InvalidArgumentException("Unsupported period: $period"),
        };
    }*/

}
