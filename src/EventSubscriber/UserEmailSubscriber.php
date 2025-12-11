<?php


namespace App\EventSubscriber;

use App\Event\UserEvent;
use App\Security\EmailVerifier;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserEmailSubscriber implements EventSubscriberInterface
{
    
    public function __construct(private MailerInterface $mailer, private TranslatorInterface $translator, private ManagerRegistry $managerRegistry, private EmailVerifier $emailVerifier, private string $noReplyEmail)
    {
    }


    public function onUserConfirmEmail(UserEvent $userEvent)
    {
        $user = $userEvent->getUser();


        $this->emailVerifier->sendEmailConfirmation(
            'app_verify_email',
            $user,
            (new TemplatedEmail())
                ->from($this->noReplyEmail)
                ->to($user->getEmail())
                ->subject($this->translator->trans('Vérifier votre adresse email'))
                ->htmlTemplate('emails/confirmation_email.html.twig')
                ->context([
                    'user' => $user,
                ])
        );
    }


    public static function getSubscribedEvents(): array
    {
        return [
            UserEvent::CONFIRM_EMAIL => 'onUserConfirmEmail'];
    }
}
