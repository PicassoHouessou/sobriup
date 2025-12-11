<?php


namespace App\Util;


use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use Gesdinet\JWTRefreshTokenBundle\Request\Extractor\ExtractorInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

final class CurrentUser
{

    private $security;
    private $em;
    private $refreshTokenManager;
    private $chainExtractor;
    private $requestStack;

    public function __construct(\Symfony\Bundle\SecurityBundle\Security $security, EntityManagerInterface $em, RefreshTokenManagerInterface $refreshTokenManager, ExtractorInterface $chainExtractor, RequestStack $requestStack)
    {
        $this->security = $security;
        $this->em = $em;
        $this->refreshTokenManager = $refreshTokenManager;
        $this->chainExtractor = $chainExtractor;
        $this->requestStack = $requestStack;
    }

    public function getToken(): ?TokenInterface
    {
        return $this->security->getToken();
    }

    /**
     * Get the current User with all fields
     *
     * @return User|null
     */
    public function getUserFull(): ?User
    {
        $currentUser = null;
        $em = $this->em;
        $request = $this->requestStack->getCurrentRequest();

        if (null === $request) {
            return null;
        }
        $currentUser = $this->getUser();
        //If the token is valid we get the current user
        if ($currentUser instanceof User) {
            $currentUser = $em->getRepository(User::class)->find($currentUser->getId());
        } else {
            //We use the refresh_token to refresh the token
            $refresh = $this->chainExtractor->getRefreshToken($request, 'refresh_token');
            $refreshToken = $this->refreshTokenManager->get($refresh);


            if ($refreshToken != null && $refreshToken->isValid()) {
                $currentUser = $em->getRepository(User::class)->findOneBy(['email' => $refreshToken->getUsername()]);
            }
        }
        return $currentUser;
    }

    /**
     * Get the current user without all fields
     * We get fields from the jwt token
     *
     * @return User|null
     */
    public function getUser()
    {
        return $this->security->getUser();
    }
}
