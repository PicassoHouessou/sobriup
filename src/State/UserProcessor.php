<?php


namespace App\State;

use ApiPlatform\Metadata\DeleteOperationInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Event\UserEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface          $persistProcessor,
        private ProcessorInterface          $removeProcessor,
        private UserPasswordHasherInterface $passwordHasher,
        private EventDispatcherInterface    $dispatcher
    )
    {
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof DeleteOperationInterface) {
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

        return $result;
    }
}
