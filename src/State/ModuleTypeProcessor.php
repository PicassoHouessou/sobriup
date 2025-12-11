<?php


namespace App\State;

use ApiPlatform\Metadata\DeleteOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Module;
use App\Entity\ModuleType;
use App\Service\MercurePublisher;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class ModuleTypeProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface  $persistProcessor,
        private ProcessorInterface  $removeProcessor,
        private MercurePublisher    $mercurePublisher,
        private NormalizerInterface $normalizer, private EntityManagerInterface $manager

    )
    {
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof DeleteOperationInterface) {
            try {
                $manager = $this->manager;
                $modules = $manager->getRepository(Module::class)->findBy(["type" => $data]);
                foreach ($modules as $module) {
                    $manager->remove($module);
                }
                $manager->flush();
                $serializedData = $this->normalizer->normalize(["type" => MercurePublisher::OPERATION_DELETE, "data" => $data], null, ['groups' => ModuleType::READ]);
                $this->mercurePublisher->publishUpdate($serializedData, ModuleType::MERCURE_TOPIC);
            } catch (\Exception $exception) {

            }
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $type = $operation instanceof Post ? MercurePublisher::OPERATION_NEW : MercurePublisher::OPERATION_UPDATE;

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);


        try {
            $serializedData = $this->normalizer->normalize(["type" => $type, "data" => $data], null, ['groups' => ModuleType::READ]);
            $this->mercurePublisher->publishUpdate($serializedData, ModuleType::MERCURE_TOPIC);
        } catch (\Exception $exception) {
            return $result;
        }


        return $result;
    }
}
