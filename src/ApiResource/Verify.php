<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\State\VerifyProcessor;
use Carbon\Carbon;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/verifies/resend',
            openapi: new \ApiPlatform\OpenApi\Model\Operation(
                summary: 'Resend Confirmation email',
                description: 'Resend confirmation email',
                responses: [
                    '200' => new \ApiPlatform\OpenApi\Model\Response(
                        description: 'Confirmation email resent'
                    )
                ]
            )
        ),
    ],
    normalizationContext: ['groups' => ['verify:read']],
    denormalizationContext: ['groups' => ['verify:write']],
    paginationEnabled: false,
    processor: VerifyProcessor::class,
)]
#[ORM\HasLifecycleCallbacks]
class Verify
{
    #[Groups(["statistic:read"])]
    public ?\DateTimeInterface $date = null;

    #[Groups(["statistic:read", 'verify:write'])]
    public ?int $userId = null;

    public function __construct()
    {
        $this->date = new \DateTime();
    }

    #[ApiProperty(identifier: true)]
    #[Groups(["statistic:read"])]
    public function getDateAgo(): string
    {
        if ($this->date === null) {
            return "";
        }
        return Carbon::instance($this->date)->diffForHumans();
    }
}
