<?php


namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class ChangePasswordController extends AbstractController
{
    private $passwordHasher;

    public function __construct(
        UserPasswordHasherInterface $passwordHasher,
    ) {
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('api/users/update/{id}', name: 'update', methods: 'POST')]
    public function __invoke(EntityManagerInterface $em, Request $request, $id): User
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            throw new BadRequestHttpException("Not Found resource");
        }
        $data = json_decode($request->getContent(), true);

        if (isset($data["oldPassword"]) && isset($data["newPassword"]) && isset($data["confirmPassword"]) && !empty($data["oldPassword"]) && !empty($data["newPassword"]) && !empty($data["confirmPassword"])) {
            $checkPassword = $this->passwordHasher->isPasswordValid($user, $data["oldPassword"]);
            if ($checkPassword === true) {
                if ($data["newPassword"] === $data["confirmPassword"]) {
                    $user->setPassword($data["newPassword"]);
                    // $user->setPassword($this->passwordHasher->hashPassword($user, $data["newPassword"]));
                } else {
                    throw new BadRequestHttpException("Repeated password must match");
                }
            } else {
                throw new BadRequestHttpException("Your password is not correct");
            }
        } else {
            throw new BadRequestHttpException("Please provide all required fields");
        }

        return $user;
    }
}
