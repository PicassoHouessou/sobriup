<?php


namespace App\Util;

use Monolog\LogRecord;
use Symfony\Component\HttpFoundation\RequestStack;

class RequestProcessor
{
    protected $request;
    protected $currentUser;

    public function __construct(
        RequestStack $request,
        CurrentUser  $currentUser
    )
    {
        $this->request = $request;
        $this->currentUser = $currentUser;
    }


    public function processRecord(LogRecord $record): array|LogRecord
    {
        $req = $this->request->getCurrentRequest();
        $record['extra']['IP'] = $req->getClientIp();
        $record['extra']['clientIp'] = $req->getClientIp();
        $record['extra']['clientPort'] = $req->getPort();
        $record['extra']['uri'] = $req->getUri();
        $record['extra']['queryString'] = $req->getQueryString();
        $record['extra']['method'] = $req->getMethod();
        $record['extra']['request'] = $req->request->all();

        $user = $this->currentUser->getUserFull();

        if ($user !== null) {
            $record['extra']['userId'] = $user->getId();
            $record['extra']['userEmail'] = $user->getEmail();
            $record['extra']['userFirstName'] = $user->getFirstName();
            $record['extra']['userLastName'] = $user->getLastName();
            $record['extra']['userRoles'] = $user->getRoles();
        } else {
            $record['extra']['userRoles'] = [];
        }

        if (isset($record['context'])) {
            $context = $record['context'];
            if (is_array($context)) {
                foreach ($context as $key => $value) {
                    $record['extra'][$key] = $value;
                }
            }
        }

        return $record;
    }
}
