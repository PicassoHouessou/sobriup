<?php


namespace App\Event;

use App\Entity\User;

class UserEvent
{
    const CONFIRM_EMAIL = 'UserEvent.confirmEmail';
    const SEND_PLAIN_PASSWORD = 'UserEvent.sendPlainPassword';

    protected $user;
    protected ?string $plainPassword = null;

    public function __construct(User $user, ?string $plainPassword = null)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
    }

    public function getUser(): User
    {
        return $this->user;
    }


    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }
}
