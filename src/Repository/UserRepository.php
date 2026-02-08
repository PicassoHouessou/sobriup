<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', $user::class));
        }

        $user->setPassword($newHashedPassword);
        $this->getEntityManager()->persist($user);
        $this->getEntityManager()->flush();
    }

    public function findCreatedBetween(\DateTimeInterface $startDate, \DateTimeInterface $endDate): array
    {
        $qb = $this->createQueryBuilder('u')
            ->where('u.createdAt BETWEEN :startDate AND :endDate')
            ->setParameter('startDate', $startDate)
            ->setParameter('endDate', $endDate);

        return $qb->getQuery()->getResult();
    }
    /**
     * Converts raw SQL rows to managed User entities.
     *
     * @param EntityManagerInterface $em
     * @param array $rows
     * @return User[]
     */
    private function hydrateResultSet(EntityManagerInterface $em, array $rows): array
    {
        if (!$rows) {
            return [];
        }

        $users = [];

        foreach ($rows as $row) {
            if (isset($row['roles']) && is_string($row['roles'])) {
                $row['roles'] = json_decode($row['roles'], true);
            }

            $users[] = $em->getUnitOfWork()->createEntity(User::class, $row);
        }

        return $users;
    }
    /**
     * Returns all users having the given role.
     * Works with PostgreSQL, MySQL, SQLite, and others.
     *
     * @param string $role
     * @return User[]
     */
    public function findByRole(string $role): array
    {
        $em = $this->getEntityManager();
        $conn = $em->getConnection();
        $platform = $conn->getDatabasePlatform()->getName(); // 'postgresql', 'mysql', 'sqlite', etc.

        // Resolve entity metadata dynamically
        $meta = $em->getClassMetadata(User::class);
        $tableName = $meta->getTableName();
        $rolesColumn = $meta->getColumnName('roles');

        // PostgreSQL optimized version
        if ($platform === 'postgresql') {
            $sql = sprintf('SELECT * FROM %s WHERE %s::jsonb @> :role', $tableName, $rolesColumn);
            $stmt = $conn->prepare($sql);
            $stmt->bindValue('role', json_encode([$role]));
            $result = $stmt->executeQuery();
            return $this->hydrateResultSet($em, $result->fetchAllAssociative());
        }

        // MySQL optimized version
        if ($platform === 'mysql') {
            $sql = sprintf('SELECT * FROM %s WHERE JSON_CONTAINS(%s, :role)', $tableName, $rolesColumn);
            $stmt = $conn->prepare($sql);
            $stmt->bindValue('role', json_encode($role));
            $result = $stmt->executeQuery();
            return $this->hydrateResultSet($em, $result->fetchAllAssociative());
        }

        // SQLite and other DBs → fallback to PHP filtering
        $users = $this->findAll();
        return array_filter($users, fn(User $user) => in_array($role, $user->getRoles(), true));
    }

}
