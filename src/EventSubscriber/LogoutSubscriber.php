<?php


namespace App\EventSubscriber;

use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

//use Symfony\Component\Security\Csrf\TokenStorage\TokenStorageInterface;

final class LogoutSubscriber implements EventSubscriberInterface
{
    private array $cookieSettings = [
        'enabled' => true,
        'same_site' => 'lax',
        'path' => '/',
        'domain' => null,
        'http_only' => true,
        'secure' => true,
        'remove_token_from_body' => false,
    ];
    private $tokenStorage;
    private RefreshTokenManagerInterface $refreshTokenManager;

    public function __construct(
        RefreshTokenManagerInterface $refreshTokenManager,
        TokenStorageInterface $tokenStorage
    ) {
        $this->refreshTokenManager = $refreshTokenManager;
        $this->tokenStorage = $tokenStorage;
    }

    //256
    public static function getSubscribedEvents(): array
    {
        return [];
        return [LogoutEvent::class => ['onLogout', 256]];
    }

    public function clear()
    {
        $clear = "clear";
        $reset = "reset";
        if (method_exists($this->tokenStorage, $clear)) {
            $this->tokenStorage->$clear();
        }
        if (method_exists($this->tokenStorage, $reset)) {
            $this->tokenStorage->$reset();
        }
        $this->tokenStorage->setToken(null);
    }

    public function onLogout(LogoutEvent $event): void
    {
        // Check if the request is an API request
        $request = $event->getRequest();
        $isApiRequest = $request && $request->headers->get('Content-Type') === 'application/json';

        if (!$isApiRequest) {
            return;
        }
        $token = $event->getToken();
        $authenticatedUser = null;
        $response = null;

        if ($token) {
            $authenticatedUser = $token->getUser();
        }

        $refreshToken = null;
        if ($authenticatedUser) {
            $refreshToken = $this->refreshTokenManager->getLastFromUsername($authenticatedUser->getUserIdentifier());
        }

        if ($refreshToken) {
            $this->refreshTokenManager->delete($refreshToken);
            $this->clear();
            $response = new JsonResponse(
                [
                    'code' => 200,
                    'message' => 'The supplied refresh_token has been invalidated',
                ],
                JsonResponse::HTTP_OK
            );
            $response->headers->clearCookie('BEARER');
            $response->headers->clearCookie('REMEMBERME');
            $event->setResponse(
                $response
            );
        }

        if ($this->cookieSettings['enabled']) {
            $response = $event->getResponse();
            if ($response instanceof Response) {
                $response->headers->clearCookie(
                    'refresh_token',
                    $this->cookieSettings['path'],
                    $this->cookieSettings['domain'],
                    $this->cookieSettings['secure'],
                    $this->cookieSettings['http_only'],
                    $this->cookieSettings['same_site']
                );
            } else {
                $response = new JsonResponse();
            }
        }
        $this->clear();
        $response->headers->clearCookie(
            'BEARER',
            $this->cookieSettings['path'],
            $this->cookieSettings['domain'],
            $this->cookieSettings['secure'],
            $this->cookieSettings['http_only'],
            $this->cookieSettings['same_site']
        );
        $response->headers->clearCookie('REMEMBERME');
        $response->send();
    }
}
