<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Common\Filter\DateFilterInterface;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\FreeTextQueryFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrFilter;
use ApiPlatform\Doctrine\Orm\Filter\PartialSearchFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\ModuleRepository;
use App\Repository\SpaceRepository;
use App\State\ModuleProcessor;
use Carbon\Carbon;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new Post(),
    ],
    normalizationContext: ['groups' => ['space:read']],
    denormalizationContext: ['groups' => ['space:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleProcessor::class,
)]
#[GetCollection(parameters: [
    'id' => new QueryParameter( filter: new ExactFilter()),
    'name' => new QueryParameter( filter: new PartialSearchFilter()),
    'description' => new QueryParameter(filter: new PartialSearchFilter()),
    'type' => new QueryParameter(filter: new ExactFilter()),
    'order[:property]' => new QueryParameter(filter: new OrderFilter(), properties: ['id','name', 'description', 'createdAt']),
    'createdAt' => new QueryParameter( filter: new DateFilter(), filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'updatedAt' => new QueryParameter( filter: new DateFilter(), filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'search' => new QueryParameter(
        filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
        properties: ['name', 'description']
    ),

])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: SpaceRepository::class)]
class Space
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["space:read", "space:write"])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\Length(max: 255)]
    #[Assert\NotBlank]
    #[Groups(["space:read", "space:write"])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(max: 5000)]
    #[Groups(["space:read", "space:write"])]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["space:read", "space:write"])]
    private ?int $floor = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(["space:read", "space:write"])]
    private ?string $surface = null;

    #[ORM\ManyToOne(targetEntity: Zone::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(["space:read", "space:write"])]
    private ?Zone $zone = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["space:read"])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["space:read"])]
    private ?\DateTimeInterface $updatedAt = null;
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getFloor(): ?int
    {
        return $this->floor;
    }

    public function setFloor(?int $floor): static
    {
        $this->floor = $floor;

        return $this;
    }

    public function getSurface(): ?string
    {
        return $this->surface;
    }

    public function setSurface(?string $surface): static
    {
        $this->surface = $surface;

        return $this;
    }

    public function getZone(): ?Zone
    {
        return $this->zone;
    }

    public function setZone(?Zone $zone): self
    {
        $this->zone = $zone;
        return $this;
    }

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function updatedTimestamps(): void
    {
        $this->updatedAt = new \DateTime('now');
        if ($this->getCreatedAt() === null) {
            $this->createdAt = new \DateTime('now');
        }
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    #[Groups(["space:read"])]
    public function getCreatedAtAgo(): string
    {
        if ($this->createdAt === null) {
            return "";
        }
        return Carbon::instance($this->createdAt)->diffForHumans();
    }
    #[Groups(["space:read"])]
    public function getUpdatedAtAgo(): string
    {
        if ($this->updatedAt === null) {
            return "";
        }
        return Carbon::instance($this->updatedAt)->diffForHumans();
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }
}
