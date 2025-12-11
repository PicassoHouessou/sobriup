<?php


namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Event\UserEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Contracts\Translation\TranslatorInterface;

final class VerifyProcessor implements ProcessorInterface
{
    public function __construct(
        private EventDispatcherInterface $dispatcher,
        private TranslatorInterface      $translator,
        private EntityManagerInterface   $entityManager
    )
    {
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        $id = $data->userId;


        $user = $this->entityManager->getRepository(User::class)->find($id);

        // Do not reveal whether a user account was found or not.
        if (!$user) {
            return throw  new BadRequestException($this->translator->trans('Utilisateur introuvable'));
        }

        $userEvent = new UserEvent($user);
        $this->dispatcher->dispatch($userEvent, UserEvent::CONFIRM_EMAIL);

        return $data;
    }


}
