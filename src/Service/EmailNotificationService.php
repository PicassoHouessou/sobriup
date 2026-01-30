<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;
use Twig\Environment;

class EmailNotificationService
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly Environment $twig,
        private readonly LoggerInterface $logger,
        private readonly string $fromEmail = 'noreply@sobriup.fr',
        private readonly string $fromName = 'Sobri\'Up'
    ) {
    }

    /**
     * Envoie un email de notification à un utilisateur
     */
    public function sendNotificationEmail(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        array $context = []
    ): bool {
        if (!$user->getEmail()) {
            $this->logger->warning('User has no email', ['user_id' => $user->getId()]);
            return false;
        }

        try {
            $email = (new Email())
                ->from($this->fromEmail)
                ->to($user->getEmail())
                ->subject($this->getEmailSubject($title, $type))
                ->html($this->renderEmailTemplate($title, $message, $type, $context));

            // Ajouter priorité selon le type
            if ($type === 'error') {
                $email->priority(Email::PRIORITY_HIGH);
            }

            $this->mailer->send($email);

            $this->logger->info('Notification email sent', [
                'user_id' => $user->getId(),
                'email' => $user->getEmail(),
                'type' => $type,
                'title' => $title,
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Failed to send notification email', [
                'user_id' => $user->getId(),
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Envoie un email de notification à plusieurs utilisateurs
     */
    public function sendNotificationEmailToMultiple(
        array $users,
        string $title,
        string $message,
        string $type = 'info',
        array $context = []
    ): array {
        $results = [
            'sent' => 0,
            'failed' => 0,
        ];

        foreach ($users as $user) {
            if ($this->sendNotificationEmail($user, $title, $message, $type, $context)) {
                $results['sent']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Génère le sujet de l'email avec emoji
     */
    private function getEmailSubject(string $title, string $type): string
    {
        $prefix = match ($type) {
            'error' => '🔴',
            'warning' => '⚠️',
            'maintenance' => '🔧',
            'system' => '⚙️',
            default => 'ℹ️',
        };

        return sprintf('%s %s - Sobri\'Up', $prefix, $title);
    }

    /**
     * Rend le template HTML de l'email
     */
    private function renderEmailTemplate(
        string $title,
        string $message,
        string $type,
        array $context
    ): string {
        try {
            return $this->twig->render('emails/notification.html.twig', [
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'context' => $context,
                'year' => date('Y'),
            ]);
        } catch (\Exception $e) {
            // Fallback si template non disponible
            return $this->getFallbackEmailTemplate($title, $message, $type);
        }
    }

    /**
     * Template HTML de secours
     */
    private function getFallbackEmailTemplate(string $title, string $message, string $type): string
    {
        $color = match ($type) {
            'error' => '#dc3545',
            'warning' => '#ffc107',
            'info' => '#0d6efd',
            'maintenance' => '#17a2b8',
            default => '#6c757d',
        };

        $icon = match ($type) {
            'error' => '🔴',
            'warning' => '⚠️',
            'maintenance' => '🔧',
            'system' => '⚙️',
            default => 'ℹ️',
        };

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: {$color}; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                                {$icon} Sobri'Up
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 20px;">
                                {$title}
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #666666; line-height: 1.6; font-size: 16px;">
                                {$message}
                            </p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee;">
                                <p style="margin: 0; color: #999999; font-size: 14px;">
                                    <strong>Type:</strong> {$type}
                                </p>
                                <p style="margin: 5px 0 0 0; color: #999999; font-size: 14px;">
                                    <strong>Date:</strong> {$this->formatDate(new \DateTime())}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © {$this->getYear()} Sobri'Up - Plateforme de gestion énergétique intelligente
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                                Vous recevez cet email car vous êtes inscrit sur Sobri'Up
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }

    private function formatDate(\DateTime $date): string
    {
        return $date->format('d/m/Y à H:i');
    }

    private function getYear(): string
    {
        return date('Y');
    }
}
