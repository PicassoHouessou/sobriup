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

        $onlineStatus = array_values(array_filter(
            $statuses,
            fn($s) => $s->getSlug() === 'en-ligne'
        ))[0];

        $faultyStatus = array_values(array_filter(
            $statuses,
            fn($s) => $s->getSlug() === 'en-panne'
        ))[0] ?? $onlineStatus;

        $startDate = (new \DateTime())->modify('-5 years');
        $endDate   = new \DateTime();

        $moduleIds = array_map(fn(Module $m) => $m->getId(), $modules);

        $statusRepo = $this->em->getRepository(ModuleStatus::class);
        $onlineStatusId = $statusRepo->findOneBy(['slug' => 'en-ligne'])->getId();
        $faultyStatusId = $statusRepo->findOneBy(['slug' => 'en-panne'])?->getId();

        foreach ($moduleIds as $moduleId) {

            $module = $this->em->getRepository(Module::class)->find($moduleId);

            $io->section('Simulation du module : ' . $module->getName());

            $currentDate = clone $startDate;

            while ($currentDate <= $endDate) {

                // 🔁 Recharge les statuts (OBLIGATOIRE après clear)
                $onlineStatus = $this->em->getRepository(ModuleStatus::class)->find($onlineStatusId);
                $faultyStatus = $faultyStatusId
                    ? $this->em->getRepository(ModuleStatus::class)->find($faultyStatusId)
                    : $onlineStatus;

                $month = (int) $currentDate->format('n');
                $isWinter = in_array($month, [11, 12, 1, 2, 3]);

                $targetTemperature = $isWinter
                    ? $faker->randomFloat(1, 19, 21)
                    : $faker->randomFloat(1, 16, 18);

                $measuredTemperature = $targetTemperature
                    + $faker->randomFloat(1, -1.5, 1.5);

                $power = max(
                    0,
                    ($targetTemperature - $measuredTemperature + 1.5)
                    * $faker->randomFloat(1, 2.0, 4.5)
                );

                $flowRate = $power > 0
                    ? $power / 10 + $faker->randomFloat(2, 0.05, 0.15)
                    : 0;

                $status = abs($measuredTemperature - $targetTemperature) > 6
                    ? $faultyStatus
                    : $onlineStatus;

                $history = new ModuleHistory();
                $history
                    ->setModule($module)
                    ->setStatus($status)
                    ->setTargetTemperature($targetTemperature)
                    ->setMeasuredTemperature($measuredTemperature)
                    ->setPower(round($power, 2))
                    ->setFlowRate(round($flowRate, 3))
                    ->setCreatedAt(clone $currentDate);

                $this->em->persist($history);

                $currentDate->modify('+1 day');
            }

            $this->em->flush();
            $this->em->clear(); // OK maintenant
        }


        $io->success('Simulation complète sur 5 ans 🎉');

        return Command::SUCCESS;
    }
}
