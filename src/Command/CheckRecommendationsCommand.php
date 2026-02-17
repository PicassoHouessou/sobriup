<?php

namespace App\Command;

use App\Service\RecommendationService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
/**
 * ✅ APPROCHE LA PLUS SIMPLE (doc Symfony 7.4) :
 * #[AsCronTask] ajoute automatiquement la commande au scheduler
 * sans créer de Message ni de Handler séparément.
 *
 * Équivalent à : 0 * * * * php bin/console app:check:recommendations
 *
 * Le worker écoute : scheduler_default
 */
#[AsCronTask(
    schedule: '0 * * * *',    // Toutes les heures à :00
    timezone: 'Europe/Paris', // Timezone France
    jitter: 30,               // Décalage aléatoire de max 30 secondes (évite les pics)
)]
#[AsCommand(
    name: 'app:check:recommendations',
    description: 'Vérifie les conditions (météo, pannes, consommation) et envoie des recommandations'
)]
class CheckRecommendationsCommand extends Command
{
    public function __construct(
        private RecommendationService $recommendationService
    )
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('force', 'f', InputOption::VALUE_NONE, 'Force l\'envoi même si aucune recommandation')
            ->setHelp(<<<'HELP'
Cette commande vérifie :
- ☀️ Conditions météo (température, ensoleillement)
- 🌙 Heure actuelle (nuit, heures creuses)
- 🔴 Pannes d'équipements
- 📈 Surconsommation anormale

Et envoie des notifications en temps réel via Mercure.

<info>Utilisation dans Cron (toutes les heures) :</info>
0 * * * * cd /path/to/project && php bin/console app:check:recommendations

<info>Utilisation dans Cron (toutes les 30 min) :</info>
*/30 * * * * cd /path/to/project && php bin/console app:check:recommendations
HELP
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $force = $input->getOption('force');

        $io->title('🔍 Vérification des recommandations Sobri\'Up');

        try {
            $recommendations = $this->recommendationService->generateRecommendations();

            if (empty($recommendations)) {
                if ($force) {
                    $io->success('✅ Aucune recommandation nécessaire (forcé)');
                } else {
                    $io->info('✅ Aucune recommandation nécessaire');
                }
                return Command::SUCCESS;
            }

            $io->section('📋 Recommandations générées (' . count($recommendations) . ')');

            $table = [];
            foreach ($recommendations as $rec) {
                $table[] = [
                    $rec['title'],
                    $rec['type'],
                    $rec['priority'],
                    substr($rec['message'], 0, 60) . '...',
                ];
            }

            $io->table(['Titre', 'Type', 'Priorité', 'Message'], $table);

            $io->success(sprintf(
                '✅ %d recommandation(s) envoyée(s) avec succès',
                count($recommendations)
            ));

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('❌ Erreur : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
