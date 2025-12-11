<?php


namespace App\Util;


use App\Entity\Log;
use Doctrine\Persistence\ManagerRegistry;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;

class MonologDBHandler extends AbstractProcessingHandler
{


    public function __construct(private ManagerRegistry $managerRegistry)
    {
        parent::__construct();
    }

    /**
     * Called when writing to our database
     * {@inheritDoc}
     */
    protected function write(LogRecord $record): void
    {
        $logEntry = new Log();
        $logEntry->setUserId($record['extra']['userId'] ?? null);
        $logEntry->setIP($record['extra']['IP']);
        $logEntry->setMessage($record['message']);
        $logEntry->setLevel($record['level']);
        $logEntry->setLevelName($record['level_name']);
        $logEntry->setUserEmail($record['extra']['userEmail'] ?? null);
        $logEntry->setUserFirstName($record['extra']['userFirstName'] ?? null);
        $logEntry->setUserLastName($record['extra']['userLastName'] ?? null);
        $logEntry->setUri($record['extra']['uri']);
        $logEntry->setRequest($record['extra']['request']);
        $logEntry->setClientIp($record['extra']['clientIp']);
        $logEntry->setClientPort($record['extra']['clientPort']);
        $logEntry->setQueryString($record['extra']['queryString']);
        $logEntry->setMethod($record['extra']['method']);


        if (in_array($record["level_name"], Log::$levelNameWithError)) {
            $logEntry->setError(true);
        } else {
            $logEntry->setError(false);
        }

        $logEntry->setUserRoles($record['extra']['userRoles']);
        $logEntry->setContext($record['context']);

        $manager = $this->managerRegistry->getManager();
        if (!$manager->isOpen()) {
            $manager = $this->managerRegistry->resetManager();
        }
        $manager->persist($logEntry);
        $manager->flush($logEntry);
    }
}
