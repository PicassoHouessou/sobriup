<?php

namespace App\ApiResource;

 use ApiPlatform\Metadata\ApiResource;
 use ApiPlatform\Metadata\Post;
 use App\State\CommandProcessor;
 use Doctrine\ORM\Mapping as ORM;
 use Symfony\Component\Serializer\Annotation\Groups;

 #[Post(processor: CommandProcessor::class)]
#[ApiResource(
    operations: [
        new Post()
    ],
    normalizationContext: ['groups' => ['command:read']],
    denormalizationContext: ['groups' => ['command:write']],
    paginationEnabled: false,
)]
#[ORM\HasLifecycleCallbacks]
class Command
{
    const READ = "command:read";
    const MERCURE_TOPIC = "/api/commands";

    #[Groups(["command:read"])]
    public ?\DateTimeInterface $date = null;


    public function __construct(?\DateTimeInterface $date = null)
    {
        $this->date = $date ?? new \DateTime();
    }

}
