<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Task>
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    /**
     * Trouve toutes les tâches actives (non complétées)
     */
    public function findActive(): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.completed = :completed')
            ->setParameter('completed', false)
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les tâches complétées
     */
    public function findCompleted(): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.completed = :completed')
            ->setParameter('completed', true)
            ->orderBy('t.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Compte le nombre de tâches actives
     */
    public function countActive(): int
    {
        return $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->andWhere('t.completed = :completed')
            ->setParameter('completed', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Supprime toutes les tâches complétées
     */
    public function deleteCompleted(): int
    {
        return $this->createQueryBuilder('t')
            ->delete()
            ->where('t.completed = :completed')
            ->setParameter('completed', true)
            ->getQuery()
            ->execute();
    }
}