<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\StatisticStateProvider;
use Carbon\Carbon;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(
            openapi: new Operation(
                summary: 'Retrieve statistics for the current and previous week.',
                description: 'Get a collection of statistics for users, modules, module statuses, module types, and module histories for the current and previous week.',
                responses: [
                    '200' => new Response(
                        description: 'Statistic collection for users, modules, module statuses, module types, and module histories for the current and previous week.',
                        content: new \ArrayObject([
                            'application/json' => [
                                'schema' => [
                                    'type' => 'array',
                                    'items' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'date' => ['type' => 'string', 'format' => 'date-time'],
                                            'user' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'total' => ['type' => 'integer'],
                                                    'thisWeekCount' => ['type' => 'integer'],
                                                    'lastWeekCount' => ['type' => 'integer'],
                                                    'increase' => ['type' => 'integer'],
                                                    'percentageIncrease' => ['type' => 'number', 'format' => 'float'],
                                                ],
                                            ],
                                            'moduleStatus' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'total' => ['type' => 'integer'],
                                                    'thisWeekCount' => ['type' => 'integer'],
                                                    'lastWeekCount' => ['type' => 'integer'],
                                                    'increase' => ['type' => 'integer'],
                                                    'percentageIncrease' => ['type' => 'number', 'format' => 'float'],
                                                ],
                                            ],
                                            'moduleType' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'total' => ['type' => 'integer'],
                                                    'thisWeekCount' => ['type' => 'integer'],
                                                    'lastWeekCount' => ['type' => 'integer'],
                                                    'increase' => ['type' => 'integer'],
                                                    'percentageIncrease' => ['type' => 'number', 'format' => 'float'],
                                                ],
                                            ],
                                            'moduleHistory' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'total' => ['type' => 'integer'],
                                                    'thisWeekCount' => ['type' => 'integer'],
                                                    'lastWeekCount' => ['type' => 'integer'],
                                                    'increase' => ['type' => 'integer'],
                                                    'percentageIncrease' => ['type' => 'number', 'format' => 'float'],
                                                ],
                                            ],
                                            'module' => [
                                                'type' => 'object',
                                                'properties' => [
                                                    'total' => ['type' => 'integer'],
                                                    'thisWeekCount' => ['type' => 'integer'],
                                                    'lastWeekCount' => ['type' => 'integer'],
                                                    'increase' => ['type' => 'integer'],
                                                    'percentageIncrease' => ['type' => 'number', 'format' => 'float'],
                                                ],
                                            ],
                                            'dateAgo' => ['type' => 'string'],
                                        ],
                                    ],
                                ],
                            ],
                        ])
                    ),
                ]
            )
        )
    ],
    normalizationContext: ['groups' => ['statistic:read']],
    paginationEnabled: false,
    provider: StatisticStateProvider::class,
)]
#[ORM\HasLifecycleCallbacks]
class Statistic
{
    #[Groups(["statistic:read"])]
    public ?\DateTimeInterface $date = null;

    #[Groups(["statistic:read"])]
    public ?array $user = null;
    #[Groups(["statistic:read"])]
    public ?array $moduleStatus = null;
    #[Groups(["statistic:read"])]
    public ?array $moduleType = null;
    #[Groups(["statistic:read"])]
    public ?array $moduleHistory = null;
    #[Groups(["statistic:read"])]
    public ?array $module = null;
    #[Groups(["statistic:read"])]
    public ?array $charts = null;

    public function __construct(\DateTimeInterface $date)
    {
        $this->date = $date;
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
