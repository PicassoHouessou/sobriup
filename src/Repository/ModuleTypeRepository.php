<?php

namespace App\Repository;

use App\Entity\ModuleType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ModuleType>
 *
 * @method ModuleType|null find($id, $lockMode = null, $lockVersion = null)
 * @method ModuleType|null findOneBy(array $criteria, array $orderBy = null)
 * @method ModuleType[]    findAll()
 * @method ModuleType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ModuleTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ModuleType::class);
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
