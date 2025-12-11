<?php

namespace App\Repository;

use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
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

}
