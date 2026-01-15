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
        $statuses = $this->em->getRepository(ModuleStatus::class)->findAll();

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

        foreach ($moduleIds as $moduleId) {
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

            while ($currentDate <= $endDate) {
                // 🔁 Recharge les statuts
                $onlineStatus = $this->em->getRepository(ModuleStatus::class)->find($onlineStatusId);
                $faultyStatus = $faultyStatusId
                    ? $this->em->getRepository(ModuleStatus::class)->find($faultyStatusId)
                    : $onlineStatus;

                $month = (int) $currentDate->format('n');
                $hour = (int) $currentDate->format('H');
                $dayOfWeek = (int) $currentDate->format('N'); // 1=lundi, 7=dimanche
                $year = (int) $currentDate->format('Y');

                // 🎯 NOUVEAU : Détection période optimisée (2024+)
                // Avant 2024 = sans Sobri'Up (gaspillages)
                // Après 2024 = avec Sobri'Up (optimisé IA)
                $isOptimized = $year >= 2024;

                // 📉 Facteur d'optimisation (gain progressif)
                // 2024 : -15% | 2025+ : -22%
                $optimizationFactor = match(true) {
                    $year < 2024 => 1.0,      // Baseline (100%)
                    $year === 2024 => 0.85,   // Gain 15%
                    default => 0.78,          // Gain 22%
                };

                // 🌦 Facteur saisonnier (hiver = + de chauffage)
                $seasonFactor = $this->getSeasonFactor($month);

                // 🕐 Facteur horaire (occupation)
                $hourFactor = $this->getHourFactor($hour, $module->getName(), $isOptimized);

                // 📅 Facteur jour de la semaine
                $weekFactor = ($dayOfWeek >= 6) ? 0.7 : 1.0;

                // 🎯 Température cible (IA plus précise après optimisation)
                if ($isOptimized) {
                    // IA optimise la température selon occupation réelle
                    $targetTemperature = $baseTargetTemp * $seasonFactor - 0.5; // -0.5°C optimisé
                    $targetTemperature += $faker->randomFloat(1, -0.2, 0.2); // Moins de variance
                } else {
                    // Avant : température plus élevée, moins précise
                    $targetTemperature = $baseTargetTemp * $seasonFactor + 0.5; // +0.5°C surchauffe
                    $targetTemperature += $faker->randomFloat(1, -0.5, 0.8);
                }
                $targetTemperature = max(16, min(22, $targetTemperature));

                // 🌡 Température mesurée (meilleure régulation après optimisation)
                if ($isOptimized) {
                    $drift = $faker->randomFloat(1, -0.5, 0.8); // Régulation précise
                } else {
                    $drift = $faker->randomFloat(1, -1.5, 2.2); // Dérive importante
                }
                $measuredTemperature = $targetTemperature + $drift;

                // 🔌 Puissance appelée (réduite après optimisation)
                $power = $basePower * $seasonFactor * $hourFactor * $weekFactor * $optimizationFactor;
                $power = max(0, $power + $faker->randomFloat(2, -2, 3));

                // 🔥 Débit gaz (m³/h)
                $flowRate = $power > 0 ? ($power / 10) + $faker->randomFloat(2, -0.05, 0.1) : 0;
                $flowRate = max(0, $flowRate);

                // ⚡ Ratio d'efficacité (meilleur après optimisation)
                if ($isOptimized) {
                    $efficiencyRatio = max(0.85, min(1.0,
                        1.0 - abs($measuredTemperature - $targetTemperature) / 15
                    ));
                } else {
                    $efficiencyRatio = max(0.7, min(0.92,
                        1.0 - abs($measuredTemperature - $targetTemperature) / 10
                    ));
                }

                // ⏱ Heures de fonctionnement (optimisées selon période)
                $operatingHours = $this->getOperatingHours($month, $hour, $dayOfWeek, $isOptimized);

                // ⚠️ Détection panne (moins fréquentes après optimisation)
                $faultRate = $isOptimized ? 1 : 3; // 1% vs 3%
                $isFaulty = $faker->boolean($faultRate);
                $status = $isFaulty ? $faultyStatus : $onlineStatus;

                // ⚡ Consommation énergétique journalière (kWh)
                if ($isFaulty) {
                    $energyConsumption = $faker->randomFloat(2, 0, 0.5);
                } else {
                    // kWh = Puissance × heures × efficacité × optimisation
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

        return Command::SUCCESS;
    }

    /**
     * Température cible de base selon le module
     */
    private function getBaseTargetTemperature(string $moduleName): float
    {
        return match (true) {
            str_contains($moduleName, 'Chaudière') => 19.5,
            str_contains($moduleName, 'Pompe') => 19.0,
            str_contains($moduleName, 'Chauffe-eau') => 55.0, // ECS
            str_contains($moduleName, 'Aérotherme') => 20.0,
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
                return $isOptimized ? 1.3 : 1.5; // Optimisé : -13%
            }
            if ($hour >= 18 && $hour <= 21) {
                return $isOptimized ? 1.2 : 1.4; // Optimisé : -14%
            }
            if ($hour >= 6 && $hour <= 10) {
                return $isOptimized ? 0.6 : 0.9; // Optimisé : -33%
            }
            return $isOptimized ? 0.2 : 0.4; // Nuit : -50%
        }

        // Logement : occupation constante mais réduite la nuit
        if (str_contains($moduleName, 'Résidence') || str_contains($moduleName, 'Sanitaires')) {
            if ($hour >= 22 || $hour <= 6) {
                return $isOptimized ? 0.5 : 0.7; // Nuit optimisée : -29%
            }
            if ($hour >= 7 && $hour <= 9) {
                return $isOptimized ? 1.0 : 1.2; // Matin : -17%
            }
            if ($hour >= 18 && $hour <= 22) {
                return $isOptimized ? 1.1 : 1.3; // Soirée : -15%
            }
            return $isOptimized ? 0.8 : 1.0; // Journée : -20%
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
            // Après optimisation : fonctionnement intelligent
            if ($isWinter) {
                return $isWeekend ? 8 : 10;  // -20% à -17%
            } else {
                return $isWeekend ? 3 : 5;   // -25% à -17%
            }
        } else {
            // Avant : fonctionnement continu, gaspillage
            if ($isWinter) {
                return $isWeekend ? 10 : 12;
            } else {
                return $isWeekend ? 4 : 6;
            }
        }
    }
}
