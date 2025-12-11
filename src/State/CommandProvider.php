<?php

namespace App\State;

use ApiPlatform\Metadata\CollectionOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Command;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * @implements ProviderInterface<Command[]|Command|null>
 */
class CommandProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $manager, private KernelInterface $kernel
    )
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof CollectionOperationInterface) {
            
            return array(new Command(new \DateTime()));
        }
        return null;
    }


}
