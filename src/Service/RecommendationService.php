<?php

namespace App\Service;

use App\Entity\Module;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class RecommendationService
{
    // Heures creuses EDF
    private const OFF_PEAK_HOURS = [
        ['start' => 22, 'end' => 6],
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly WeatherService         $weatherService,
        private readonly NotificationService    $notificationService,
        private readonly LoggerInterface        $logger
    )
    {
    }

    /**
     * Génère toutes les recommandations et envoie les notifications
     */
    public function generateRecommendations(): array
    {
        $recommendations = [];

        // 1️⃣ Vérifications météo
        $weatherRecommendations = $this->checkWeatherConditions();
        $recommendations = array_merge($recommendations, $weatherRecommendations);

        // 2️⃣ Vérifications horaires
        $timeRecommendations = $this->checkTimeConditions();
        $recommendations = array_merge($recommendations, $timeRecommendations);

        // 3️⃣ Détection de pannes
        $faultRecommendations = $this->checkModuleFaults();
        $recommendations = array_merge($recommendations, $faultRecommendations);

        // 4️⃣ Détection de surconsommation
        $consumptionRecommendations = $this->checkOverConsumption();
        $recommendations = array_merge($recommendations, $consumptionRecommendations);

        // 5️⃣ Envoi des notifications
        foreach ($recommendations as $recommendation) {
            // ✅ Envoyer email UNIQUEMENT pour les priorités critiques
            $sendEmail = in_array($recommendation['priority'], ['critical', 'high']);
            $this->notificationService->sendToAllUsers(
                $recommendation['title'],
                $recommendation['message'],
                $recommendation['type'],
                $sendEmail, // Email activé pour critical/high
                $sendEmail  // Seulement aux admins si email activé
            );
        }

        return $recommendations;
    }

    /**
     * ☀️ Recommandations basées sur la météo
     */
    private function checkWeatherConditions(): array
    {
        $recommendations = [];
        $weatherCheck = $this->weatherService->shouldReduceHeating();

        if ($weatherCheck['should_reduce']) {
            foreach ($weatherCheck['recommendations'] as $rec) {
                $temp = $weatherCheck['weather']['temperature'];
                $weatherDesc = $this->weatherService->getWeatherDescription(
                    $weatherCheck['weather']['weather_code'] ?? 0
                );

                $recommendations[] = [
                    'title' => '🌡️ Météo favorable',
                    'message' => "{$rec['reason']}. {$rec['suggestion']}. Conditions actuelles : {$weatherDesc}, {$temp}°C.",
                    'type' => 'info',
                    'priority' => $rec['priority'],
                ];

                $this->logger->info('Weather recommendation generated', $rec);
            }
        }

        return $recommendations;
    }

    /**
     * 🌙 Recommandations basées sur l'heure
     */
    private function checkTimeConditions(): array
    {
        $recommendations = [];
        $currentHour = (int)(new \DateTime())->format('H');

        // Période nocturne
        if ($currentHour >= 23 || $currentHour < 6) {
            $activeModules = $this->em->getRepository(Module::class)
                ->createQueryBuilder('m')
                ->select('m')
                ->innerJoin('m.space', 's')
                ->innerJoin('s.zone', 'z')
                ->where("z.name LIKE '%Restaurant%'")
                ->getQuery()
                ->getResult();

            if (count($activeModules) > 0) {
                $recommendations[] = [
                    'title' => '🌙 Période nocturne',
                    'message' => "Il est {$currentHour}h. Pensez à réduire ou éteindre le chauffage des restaurants universitaires (fermés la nuit).",
                    'type' => 'info',
                    'priority' => 'medium',
                ];
            }
        }

        // Heures creuses
        if ($this->isOffPeakHour($currentHour)) {
            $recommendations[] = [
                'title' => '⚡ Heures creuses',
                'message' => "Vous êtes en heures creuses EDF ({$currentHour}h). C'est le moment idéal pour les opérations énergétiques non urgentes.",
                'type' => 'info',
                'priority' => 'low',
            ];
        }

        return $recommendations;
    }

    /**
     * Vérifie si l'heure actuelle est en heures creuses
     */
    private function isOffPeakHour(int $hour): bool
    {
        foreach (self::OFF_PEAK_HOURS as $period) {
            if ($period['start'] > $period['end']) {
                if ($hour >= $period['start'] || $hour < $period['end']) {
                    return true;
                }
            } else {
                if ($hour >= $period['start'] && $hour < $period['end']) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 🔴 Détection de pannes
     */
    private function checkModuleFaults(): array
    {
        $recommendations = [];

        $faultyStatus = $this->em->getRepository(ModuleStatus::class)
            ->findOneBy(['slug' => 'en-panne']);

        if (!$faultyStatus) {
            return [];
        }

        $qb = $this->em->getRepository(ModuleHistory::class)
            ->createQueryBuilder('mh');

        $faultyModules = $qb
            ->select('IDENTITY(mh.module) as module_id, m.name as module_name, z.name as zone_name, MAX(mh.createdAt) as last_seen')
            ->innerJoin('mh.module', 'm')
            ->innerJoin('m.space', 's')
            ->innerJoin('s.zone', 'z')
            ->where('mh.status = :status')
            ->andWhere('mh.createdAt >= :since')
            ->setParameter('status', $faultyStatus)
            ->setParameter('since', new \DateTime('-24 hours'))
            ->groupBy('mh.module, m.name, z.name')
            ->getQuery()
            ->getResult();

        foreach ($faultyModules as $fault) {
            $timeSince = (new \DateTime())->diff(new \DateTime($fault['last_seen']))->h;

            $recommendations[] = [
                'title' => '🔴 Panne détectée',
                'message' => "Le module '{$fault['module_name']}' ({$fault['zone_name']}) est en panne depuis {$timeSince}h. Intervention de maintenance requise.",
                'type' => 'error',
                'priority' => 'critical', // ✅ Email activé
            ];

            $this->logger->warning('Module fault detected', $fault);
        }

        return $recommendations;
    }

    /**
     * 📈 Détection de surconsommation
     */
    private function checkOverConsumption(): array
    {
        $recommendations = [];

        $last24h = $this->em->getRepository(ModuleHistory::class)
            ->createQueryBuilder('mh')
            ->select('SUM(mh.energyConsumption) as total')
            ->where('mh.createdAt >= :since')
            ->setParameter('since', new \DateTime('-24 hours'))
            ->getQuery()
            ->getSingleScalarResult();

        $avg30days = $this->em->getRepository(ModuleHistory::class)
            ->createQueryBuilder('mh')
            ->select('AVG(mh.energyConsumption) as avg')
            ->where('mh.createdAt >= :since')
            ->andWhere('mh.createdAt < :until')
            ->setParameter('since', new \DateTime('-30 days'))
            ->setParameter('until', new \DateTime('-24 hours'))
            ->getQuery()
            ->getSingleScalarResult();

        $avg30daysTotal = $avg30days * 30;
        $threshold = $avg30daysTotal * 1.2;

        if ($last24h > $threshold) {
            $increase = round((($last24h - $avg30daysTotal) / $avg30daysTotal) * 100, 1);

            $recommendations[] = [
                'title' => '📈 Surconsommation détectée',
                'message' => "Votre consommation est {$increase}% supérieure à la normale. Vérifiez les équipements et les températures de consigne.",
                'type' => 'warning',
                'priority' => 'high', // ✅ Email activé
            ];

            $this->logger->warning('Over consumption detected', [
                'last_24h' => $last24h,
                'avg_30days' => $avg30daysTotal,
                'increase' => $increase,
            ]);
        }

        return $recommendations;
    }
}
