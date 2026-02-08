<?php

namespace App\Service;

use App\Entity\Notification;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class NotificationService
{
    public function __construct(
        private readonly EntityManagerInterface   $em,
        private readonly MercurePublisher         $mercurePublisher,
        private readonly NormalizerInterface      $normalizer,
        private readonly EmailNotificationService $emailService,
        private readonly UserRepository           $userRepository,
    )
    {
    }

    /**
     * Envoie une notification à tous les utilisateurs
     *
     * @param bool $sendEmail Si true, envoie également des emails
     * @param bool $onlyAdmins Si true, envoie seulement aux admins
     */
    public function sendToAllUsers(
        string $title,
        string $message,
        string $type = 'info',
        bool   $sendEmail = false,
        bool   $onlyAdmins = false
    ): array
    {
        if ($onlyAdmins) {
            $users = $this->userRepository->findByRole('ROLE_ADMIN');
        } else {
            $users = $this->userRepository->findAll();
        }


        $notifications = [];

        foreach ($users as $user) {
            $notifications[] = $this->sendToUser($user, $title, $message, $type, $sendEmail);
        }

        return $notifications;
    }

    /**
     * Envoie une notification à un utilisateur spécifique
     *
     * @param bool $sendEmail Si true, envoie également un email
     */
    public function sendToUser(
        User   $user,
        string $title,
        string $message,
        string $type = 'info',
        bool   $sendEmail = false
    ): Notification
    {
        $notification = new Notification();
        $notification
            ->setUser($user)
            ->setTitle($title)
            ->setMessage($message)
            ->setType($type)
            ->setIsRead(false);

        $this->em->persist($notification);
        $this->em->flush();

        // ✅ Publier via Mercure
        $this->publishToMercure($notification);

        // ✅ Envoyer email si demandé
        if ($sendEmail) {
            $this->emailService->sendNotificationEmail($user, $title, $message, $type);
        }

        return $notification;
    }

    /**
     * ✅ Publie la notification via Mercure
     */
    private function publishToMercure(Notification $notification): void
    {
        try {
            $data = $this->normalizer->normalize($notification, null, [
                'groups' => ['notification:read']
            ]);

            // Topic Mercure pour les notifications
            $this->mercurePublisher->publishUpdate(
                [
                    'type' => MercurePublisher::OPERATION_NEW,
                    'data' => $data
                ],
                Notification::MERCURE_TOPIC // Topic
            );
        } catch (\Exception $e) {
            // Log mais ne bloque pas
        }
    }

    /**
     * Marque une notification comme lue
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->setIsRead(true);
        $this->em->flush();

        // Publier l'update via Mercure
        $this->publishToMercure($notification);
    }

    /**
     * Récupère les notifications non lues d'un utilisateur
     */
    public function getUnreadForUser(User $user): array
    {
        return $this->em->getRepository(Notification::class)
            ->findBy(['user' => $user, 'isRead' => false], ['createdAt' => 'DESC']);
    }

    /**
     * Compte les notifications non lues d'un utilisateur
     */
    public function countUnreadForUser(User $user): int
    {
        return $this->em->getRepository(Notification::class)
            ->count(['user' => $user, 'isRead' => false]);
    }

    /**
     * Supprime les anciennes notifications (> 30 jours et lues)
     */
    public function cleanOldNotifications(): int
    {
        $qb = $this->em->createQueryBuilder();

        $query = $qb->delete(Notification::class, 'n')
            ->where('n.isRead = :isRead')
            ->andWhere('n.createdAt < :date')
            ->setParameter('isRead', true)
            ->setParameter('date', new \DateTime('-30 days'))
            ->getQuery();

        return $query->execute();
    }
}
