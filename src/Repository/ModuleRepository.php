<?php

namespace App\Repository;

use App\Entity\Module;
use App\Entity\ModuleType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Module>
 *
 * @method Module|null find($id, $lockMode = null, $lockVersion = null)
 * @method Module|null findOneBy(array $criteria, array $orderBy = null)
 * @method Module[]    findAll()
 * @method Module[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ModuleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Module::class);
    }

    public function findCreatedBetween(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        return $qb->getQuery()->getResult();
    }


    public function findByType(ModuleType $type): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.type = :type')
            ->setParameter('type', $type);

        return $qb->getQuery()->getResult();
    }

    public function total(): int
    {
        return $this->countForType();
    }

    public function countForType(?ModuleType $type = null): int
    {
        $query = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)');
        if ($type) {
            $query->andWhere('u.type = :type')
                ->setParameter('type', $type);
        }
        $result = $query->getQuery()
            ->getSingleScalarResult();
        return $result;
    }

    public function countForLast12Months(?ModuleType $type = null): array
    {
        $endDate = new \DateTime();
        $startDate = (clone $endDate)->modify('-12 months');

        $query = $this->createQueryBuilder('u')
            ->select('SUBSTRING(u.createdAt, 1, 7) as year_month, COUNT(u.id) as count')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->groupBy('year_month')
            ->orderBy('year_month', 'ASC');

        if ($type) {
            $query->andWhere('u.type = :type')
                ->setParameter('type', $type);
        }

        return $query->getQuery()->getResult();
    }

    public function countForLast7Days(?ModuleType $type = null): array
    {
        $endDate = new \DateTime();
        $startDate = (clone $endDate)->modify('-7 days');

        $query = $this->createQueryBuilder('u')
            ->select('SUBSTRING(u.createdAt, 1, 10) as date, COUNT(u.id) as count')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC');

        if ($type) {
            $query->andWhere('u.type = :type')
                ->setParameter('type', $type);
        }

        return $query->getQuery()->getResult();
    }

    /**
     * @param ModuleType|null $type
     * @return array
     * @deprecated It works only for mysql or mariadb, and it will be removed in the future
     */
    public function countForLast12MonthsMySql(?ModuleType $type = null): array
    {
        $endDate = new \DateTime();
        $startDate = (clone $endDate)->modify('-12 months');

        $query = $this->createQueryBuilder('u')
            ->select('YEAR(u.createdAt) as year, MONTH(u.createdAt) as month, COUNT(u.id) as count')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->groupBy('year, month')
            ->orderBy('year, month', 'ASC');

        if ($type) {
            $query->andWhere('u.type = :type')
                ->setParameter('type', $type);
        }

        return $query->getQuery()->getResult();
    }

    /**
     * @param ModuleType|null $type
     * @return array
     * @deprecated It works only for mysql or mariadb, and it will be removed in the future
     */
    public function countForLast7DaysMySql(?ModuleType $type = null): array
    {
        $endDate = new \DateTime();
        $startDate = (clone $endDate)->modify('-7 days');

        $query = $this->createQueryBuilder('u')
            ->select('DATE(u.createdAt) as date, COUNT(u.id) as count')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC');

        if ($type) {
            $query->andWhere('u.type = :type')
                ->setParameter('type', $type);
        }

        return $query->getQuery()->getResult();
    }


}
