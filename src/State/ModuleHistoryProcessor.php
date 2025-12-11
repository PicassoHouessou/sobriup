<?php


namespace App\State;

use ApiPlatform\Metadata\DeleteOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use App\Service\MercurePublisher;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class ModuleHistoryProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface  $persistProcessor,
        private ProcessorInterface  $removeProcessor,
        private MercurePublisher    $mercurePublisher,
        private NormalizerInterface $normalizer,

    )
    {
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof DeleteOperationInterface) {
            try {
                $serializedData = $this->normalizer->normalize(["type" => MercurePublisher::OPERATION_DELETE, "data" => $data], null, ['groups' => ModuleStatus::READ]);
                $this->mercurePublisher->publishUpdate($serializedData, ModuleHistory::MERCURE_TOPIC);
            } catch (\Exception $exception) {

            }
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $type = $operation instanceof Post ? MercurePublisher::OPERATION_NEW : MercurePublisher::OPERATION_UPDATE;

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);


        try {
            $serializedData = $this->normalizer->normalize(["type" => $type, "data" => $data], null, ['groups' => ModuleHistory::READ]);
            $this->mercurePublisher->publishUpdate($serializedData, ModuleHistory::MERCURE_TOPIC);
        } catch (\Exception $exception) {
            return $result;
        }


        return $result;
    }
}
