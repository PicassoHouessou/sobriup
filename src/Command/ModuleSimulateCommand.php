<?php

namespace App\Command;

use App\Entity\Module;
use App\Entity\ModuleHistory;
use App\Entity\ModuleStatus;
use Doctrine\ORM\EntityManagerInterface;
use Faker\Factory;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:module:simulate',
    description: 'Simulate realistic module data (temperature, power, flow) over several years'
)]
class ModuleSimulateCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $faker = Factory::create();

        $modules = $this->em->getRepository(Module::class)->findAll();

        $statusRepo = $this->em->getRepository(ModuleStatus::class);
        $onlineStatusId = $statusRepo->findOneBy(['slug' => 'en-ligne'])?->getId();
        $faultyStatusId = $statusRepo->findOneBy(['slug' => 'en-panne'])?->getId();

        if (!$onlineStatusId) {
            $io->error('Status "en-ligne" not found');
            return Command::FAILURE;
        }

        $startDate = (new \DateTime())->modify('-5 years');
        $endDate = new \DateTime();

        $moduleIds = array_map(fn(Module $m) => $m->getId(), $modules);
        $totalModules = count($moduleIds);

        foreach ($moduleIds as $index => $moduleId) {
            $module = $this->em->getRepository(Module::class)->find($moduleId);

            if (!$module) {
                continue;
            }

            $io->section('Simulation du module : ' . $module->getName());

            $currentDate = clone $startDate;
            $batchSize = 100;
            $count = 0;

            // ✅ Profil réaliste selon le type de module
            $baseTargetTemp = $this->getBaseTargetTemperature($module->getName());
            $basePower = $this->getBasePower($module->getName());

            // 🔧 NOUVEAU : Forcer le dernier module en panne à la fin
            $isLastModule = ($index === $totalModules - 1);

            while ($currentDate <= $endDate) {
                // 🔁 Recharge les statuts
                $onlineStatus = $this->em->getRepository(ModuleStatus::class)->find($onlineStatusId);
                $faultyStatus = $faultyStatusId
                    ? $this->em->getRepository(ModuleStatus::class)->find($faultyStatusId)
                    : $onlineStatus;

                $month = (int) $currentDate->format('n');
                $hour = (int) $currentDate->format('H');
                $dayOfWeek = (int) $currentDate->format('N');
                $year = (int) $currentDate->format('Y');

                // 🎯 Détection période optimisée (2024+)
                $isOptimized = $year >= 2024;

                // 📉 Facteur d'optimisation
                $optimizationFactor = match(true) {
                    $year < 2024 => 1.0,      // Baseline
                    $year === 2024 => 0.85,   // -15%
                    default => 0.78,          // -22%
                };

                // 🌦 Facteur saisonnier
                $seasonFactor = $this->getSeasonFactor($month);

                // 🕐 Facteur horaire
                $hourFactor = $this->getHourFactor($hour, $module->getName(), $isOptimized);

                // 📅 Facteur jour de la semaine
                $weekFactor = ($dayOfWeek >= 6) ? 0.7 : 1.0;

                // 🎯 Température cible (≤ 19°C norme tertiaire)
                if ($isOptimized) {
                    // Après : optimisation IA, respect strict de la norme
                    $targetTemperature = $baseTargetTemp * $seasonFactor - 0.3;
                    $targetTemperature += $faker->randomFloat(1, -0.2, 0.2);
                } else {
                    // Avant : dépassement fréquent de la norme
                    $targetTemperature = $baseTargetTemp * $seasonFactor + 0.8;
                    $targetTemperature += $faker->randomFloat(1, -0.3, 0.5);
                }
                // ⚠️ Limite stricte : 19°C maximum (norme tertiaire)
                $targetTemperature = max(16, min(19, $targetTemperature));

                // 🌡 Température mesurée
                if ($isOptimized) {
                    $drift = $faker->randomFloat(1, -0.4, 0.6);
                } else {
                    $drift = $faker->randomFloat(1, -1.2, 1.8);
                }
                $measuredTemperature = $targetTemperature + $drift;

                // 🔌 Puissance appelée
                $power = $basePower * $seasonFactor * $hourFactor * $weekFactor * $optimizationFactor;
                $power = max(0, $power + $faker->randomFloat(2, -2, 3));

                // 🔥 Débit gaz
                $flowRate = $power > 0 ? ($power / 10) + $faker->randomFloat(2, -0.05, 0.1) : 0;
                $flowRate = max(0, $flowRate);

                // ⚡ Ratio d'efficacité
                if ($isOptimized) {
                    $efficiencyRatio = max(0.85, min(1.0,
                        1.0 - abs($measuredTemperature - $targetTemperature) / 15
                    ));
                } else {
                    $efficiencyRatio = max(0.7, min(0.92,
                        1.0 - abs($measuredTemperature - $targetTemperature) / 10
                    ));
                }

                // ⏱ Heures de fonctionnement
                $operatingHours = $this->getOperatingHours($month, $hour, $dayOfWeek, $isOptimized);

                // ⚠️ Détection panne
                // 🔧 NOUVEAU : Forcer panne pour le dernier module sur les 30 derniers jours
                $daysUntilEnd = $currentDate->diff($endDate)->days;
                if ($isLastModule && $daysUntilEnd <= 30) {
                    $isFaulty = true;
                    $io->writeln("  ⚠️  Module en panne (forcé pour démo) - {$daysUntilEnd} jours avant fin");
                } else {
                    $faultRate = $isOptimized ? 1 : 3;
                    $isFaulty = $faker->boolean($faultRate);
                }

                $status = $isFaulty ? $faultyStatus : $onlineStatus;

                // ⚡ Consommation énergétique
                if ($isFaulty) {
                    $energyConsumption = $faker->randomFloat(2, 0, 0.5);
                } else {
                    $energyConsumption = round(
                        $power * $operatingHours * $efficiencyRatio,
                        2
                    );
                    $energyConsumption = max(0, $energyConsumption);
                }

                $history = new ModuleHistory();
                $history
                    ->setModule($module)
                    ->setStatus($status)
                    ->setTargetTemperature(round($targetTemperature, 1))
                    ->setMeasuredTemperature(round($measuredTemperature, 1))
                    ->setPower(round($power, 2))
                    ->setFlowRate(round($flowRate, 3))
                    ->setEnergyConsumption($energyConsumption)
                    ->setCreatedAt(clone $currentDate);

                $this->em->persist($history);

                $count++;
                if (($count % $batchSize) === 0) {
                    $this->em->flush();
                    $this->em->clear();
                    $io->writeln("  ✓ $count entrées créées...");

                    // Recharge le module
                    $module = $this->em->getRepository(Module::class)->find($moduleId);
                }

                $currentDate->modify('+1 day');
            }

            $this->em->flush();
            $this->em->clear();

            $io->success('Simulation terminée pour ' . $module->getName() . " ($count entrées)");
        }

        $io->success('Simulation complète sur 5 ans 🎉');
        $io->note('Le dernier module a été forcé en panne sur les 30 derniers jours pour démonstration.');

        return Command::SUCCESS;
    }

    /**
     * Température cible de base selon le module
     * ⚠️ Norme Décret Tertiaire : 19°C maximum en moyenne
     */
    private function getBaseTargetTemperature(string $moduleName): float
    {
        return match (true) {
            str_contains($moduleName, 'Chaudière') => 19.0,  // Conforme norme
            str_contains($moduleName, 'Pompe') => 18.5,      // Conforme norme
            str_contains($moduleName, 'Chauffe-eau') => 55.0, // ECS (exception santé)
            str_contains($moduleName, 'Aérotherme') => 19.0,  // Conforme norme
            default => 19.0,
        };
    }

    /**
     * Puissance de base selon le module (kW)
     */
    private function getBasePower(string $moduleName): float
    {
        return match (true) {
            str_contains($moduleName, 'Chaudière') => 45.0,
            str_contains($moduleName, 'Pompe') => 12.0,
            str_contains($moduleName, 'Chauffe-eau') => 8.0,
            str_contains($moduleName, 'Aérotherme') => 25.0,
            default => 15.0,
        };
    }

    /**
     * Facteur saisonnier (hiver = plus de chauffage)
     */
    private function getSeasonFactor(int $month): float
    {
        return match (true) {
            in_array($month, [12, 1, 2]) => 1.3,        // Hiver
            in_array($month, [11, 3]) => 1.15,          // Inter-saison froide
            in_array($month, [4, 5, 9, 10]) => 0.85,    // Inter-saison douce
            in_array($month, [6, 7, 8]) => 0.4,         // Été
            default => 1.0,
        };
    }

    /**
     * Facteur horaire (occupation du bâtiment)
     */
    private function getHourFactor(int $hour, string $moduleName, bool $isOptimized): float
    {
        // Restaurant : pics midi + soir
        if (str_contains($moduleName, 'Restaurant') || str_contains($moduleName, 'Cuisine')) {
            if ($hour >= 11 && $hour <= 14) {
                return $isOptimized ? 1.3 : 1.5;
            }
            if ($hour >= 18 && $hour <= 21) {
                return $isOptimized ? 1.2 : 1.4;
            }
            if ($hour >= 6 && $hour <= 10) {
                return $isOptimized ? 0.6 : 0.9;
            }
            return $isOptimized ? 0.2 : 0.4;
        }

        // Logement : occupation constante mais réduite la nuit
        if (str_contains($moduleName, 'Résidence') || str_contains($moduleName, 'Sanitaires')) {
            if ($hour >= 22 || $hour <= 6) {
                return $isOptimized ? 0.5 : 0.7;
            }
            if ($hour >= 7 && $hour <= 9) {
                return $isOptimized ? 1.0 : 1.2;
            }
            if ($hour >= 18 && $hour <= 22) {
                return $isOptimized ? 1.1 : 1.3;
            }
            return $isOptimized ? 0.8 : 1.0;
        }

        return $isOptimized ? 0.85 : 1.0;
    }

    /**
     * Heures de fonctionnement journalières
     */
    private function getOperatingHours(int $month, int $hour, int $dayOfWeek, bool $isOptimized): float
    {
        $isWinter = in_array($month, [11, 12, 1, 2, 3]);
        $isWeekend = $dayOfWeek >= 6;

        if ($isOptimized) {
            if ($isWinter) {
                return $isWeekend ? 8 : 10;
            } else {
                return $isWeekend ? 3 : 5;
            }
        } else {
            if ($isWinter) {
                return $isWeekend ? 10 : 12;
            } else {
                return $isWeekend ? 4 : 6;
            }
        }
    }
}
