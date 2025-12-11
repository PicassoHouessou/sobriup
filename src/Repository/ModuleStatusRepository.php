<?php

namespace App\Repository;

use App\Entity\ModuleStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ModuleStatus>
 *
 * @method ModuleStatus|null find($id, $lockMode = null, $lockVersion = null)
 * @method ModuleStatus|null findOneBy(array $criteria, array $orderBy = null)
 * @method ModuleStatus[]    findAll()
 * @method ModuleStatus[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ModuleStatusRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ModuleStatus::class);
    }

    public function findCreatedBetween(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        return $qb->getQuery()->getResult();
    }


}
