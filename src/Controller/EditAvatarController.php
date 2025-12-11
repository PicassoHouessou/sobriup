<?php


namespace App\Controller;

use App\Entity\User;
use App\Service\FileUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class EditAvatarController extends AbstractController
{
    public function __invoke(EntityManagerInterface $em, Request $request, FileUploader $fileUploader, $id): User
    {
        $user = $em->getRepository(User::class)->find($id);
        $uploadedFile = $request->files->get('avatar');
        if ($uploadedFile) {
            $user->setAvatar($fileUploader->upload($uploadedFile));
        }
        return $user;
    }
}
