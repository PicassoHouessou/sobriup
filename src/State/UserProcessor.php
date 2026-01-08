<?php


namespace App\State;

use ApiPlatform\Metadata\DeleteOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\ModuleStatus;
use App\Entity\ModuleType;
use App\Entity\User;
use App\Event\UserEvent;
use App\Service\MercurePublisher;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class UserProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface          $persistProcessor,
        private ProcessorInterface          $removeProcessor,
        private UserPasswordHasherInterface $passwordHasher,
        private EventDispatcherInterface    $dispatcher,
        private MercurePublisher    $mercurePublisher,
        private NormalizerInterface $normalizer, private EntityManagerInterface $manager
    )
    {
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof DeleteOperationInterface) {
            try {
                $serializedData = $this->normalizer->normalize(["type" => MercurePublisher::OPERATION_DELETE, "data" => $data], null, ['groups' => User::READ]);
                $this->mercurePublisher->publishUpdate($serializedData, User::MERCURE_TOPIC);
            } catch (\Exception $exception) {

            }
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $password = $data->getPassword();
        if ($password && !empty($password) && strlen($password) <= 20) {
            $data->setPassword(
                $this->passwordHasher->hashPassword($data, $data->getPassword())
            );
        }

        // Send the mail only for new user
        $sendEmail = false;
        if ($data->getId() == null) {
            $sendEmail = true;
        }

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        // It is important to dispatch event with result
        if ($sendEmail) {
            $userEvent = new UserEvent($result);
            try {
                $this->dispatcher->dispatch($userEvent, UserEvent::CONFIRM_EMAIL);
            } catch (\Exception $e) {
            }
        }

        $type = $operation instanceof Post ? MercurePublisher::OPERATION_NEW : MercurePublisher::OPERATION_UPDATE;

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);


        try {
            $serializedData = $this->normalizer->normalize(["type" => $type, "data" => $data], null, ['groups' => User::READ]);
            $this->mercurePublisher->publishUpdate($serializedData, User::MERCURE_TOPIC);
        } catch (\Exception $exception) {
            return $result;
        }

        return $result;
    }
}
