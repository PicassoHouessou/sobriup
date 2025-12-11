<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_admin', requirements: ['reactRouting' => '^(?!api|(_(profiler|wdt)|css|images|js)/).+'], defaults: ['reactRouting' => null], priority: 10)]
    public function index(): Response
    {
        return $this->render('admin/index.html.twig', [
        ]);
    }
}
