<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Util\CurrentUser;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LogSubscriber implements EventSubscriberInterface
{
    private $currentUser;
    private $logger;

    /**
     * It is important to not change the name dbLogger
     *
     * @param CurrentUser $currentUser
     * @param LoggerInterface $dbLogger
     *
     * @see https://symfony.com/doc/5.4/logging/channels_handlers.html#how-to-autowire-logger-channels
     */
    public function __construct(CurrentUser $currentUser, LoggerInterface $dbLogger)
    {
        $this->currentUser = $currentUser;
        $this->logger = $dbLogger;
    }

    public function onKernelResponse(ResponseEvent $event)
    {
        $user = $this->currentUser->getUserFull();
        if (!$user instanceof User) {
            return;
        }
        $this->logger->info('Simple log');
    }

    public function onKernelException(ExceptionEvent $event)
    {
        $user = $this->currentUser->getUserFull();
        if (!$user instanceof User) {
            return;
        }

        $this->logger->error('An error occured: ' . $event->getThrowable()->getMessage());
    }

    public static function getSubscribedEvents(): array
    {
        // return the subscribed events, their methods and priorities
        return [
            KernelEvents::RESPONSE => ['onKernelResponse'],
            KernelEvents::EXCEPTION => [
                'onKernelException',
            ],
        ];
    }
}
