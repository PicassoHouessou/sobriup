<?php

namespace App\Security\Voter;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class UserVoter extends Voter
{
    public const EDIT = 'USER_EDIT';
    public const VIEW = 'USER_VIEW';

    public function __construct(private readonly Security $security)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        // replace with your own logic
        // https://symfony.com/doc/current/security/voters.html
        return in_array($attribute, [self::EDIT, self::VIEW])
            && $subject instanceof \App\Entity\User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        // ROLE_ADMIN can do anything!
        if ($this->security->isGranted('ROLE_ADMIN')) {
            return true;
        }

        $user = $token->getUser();

        // if the user is anonymous, do not grant access
        if (!$user instanceof UserInterface) {
            return false;
        }

        // ... (check conditions and return true to grant permission) ...
        switch ($attribute) {
            case self::EDIT:
                return $this->canEdit($subject, $user);
                break;

            case self::VIEW:
                return $this->canView($subject, $user);
                break;
        }

        return false;
    }

    private function canEdit(User $data, User $currentUser): bool
    {
        // User can edit itself
        if ($data->getEmail() == $currentUser->getUserIdentifier() || $data->getId() == $currentUser->getId()) {
            return true;
        }

        // ROLE_MANAGER CANNOT DELETE USERS with role ROLE_ADMIN
        //ROLE_MANAGER can create, edit and delete users (not with role ROLE_ADMIN)
        if ($this->security->isGranted('ROLE_MANAGER') && in_array("ROLE_ADMIN", $data->getRoles()) === false) {
            return true;
        }

        return false;
    }

    private function canView(User $data, User $user): bool
    {
        // if they can edit, they can view
        if ($this->canEdit($data, $user)) {
            return true;
        }

        if ($this->security->isGranted('ROLE_MANAGER')) {
            return true;
        }

        return false;
    }
}
