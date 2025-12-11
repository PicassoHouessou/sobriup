<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    #[Route('/verify/email', name: 'app_verify_email', priority: 100)]
    public function verifyUserEmail(Request $request, TranslatorInterface $translator, EmailVerifier $emailVerifier, UserRepository $userRepository): Response
    {
        $id = $request->query->get('id'); // retrieve the user id from the url
        if (null === $id) {
            return $this->redirectToRoute('app_admin');
        }
        $user = $userRepository->find($id);
        if (null === $user) {
            return $this->redirectToRoute('app_admin');
        }
        // validate email confirmation link, sets User::isVerified=true and persists
        try {
            $emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            $this->addFlash('verify_email_error', $translator->trans($exception->getReason(), [], 'VerifyEmailBundle'));
            return $this->redirectToRoute('app_admin');
        }

        // @TODO Change the redirect on success and handle or remove the flash message in your templates
        $this->addFlash('success', 'Your email address has been verified.');

        return $this->redirectToRoute('app_admin');
    }

}
