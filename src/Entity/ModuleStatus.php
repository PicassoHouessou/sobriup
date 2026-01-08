<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\FreeTextQueryFilter;
use ApiPlatform\Doctrine\Orm\Filter\IriFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrFilter;
use ApiPlatform\Doctrine\Orm\Filter\PartialSearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\ModuleStatusRepository;
use App\State\ModuleStatusProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Doctrine\Common\Filter\DateFilterInterface;
#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Delete(),
        new Patch,
        new Post(),
    ],
    normalizationContext: ['groups' => ['module_status:read']],
    denormalizationContext: ['groups' => ['module_status:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleStatusProcessor::class,

)]
#[GetCollection(parameters: [
    'id' => new QueryParameter( filter: new ExactFilter()),
    'name' => new QueryParameter( filter: new PartialSearchFilter()),
    'slug' => new QueryParameter(filter: new ExactFilter()),
    'order[:property]' => new QueryParameter(filter: new OrderFilter(), properties: ['id','name', 'slug', 'createdAt']),
    'createdAt' => new QueryParameter( filter: new DateFilter(), filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'search' => new QueryParameter(
        filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
        properties: ['name', 'slug']
    ),

])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: ModuleStatusRepository::class)]
#[UniqueEntity("name")]
#[UniqueEntity("slug")]
class ModuleStatus
{
    const READ = "module_status:read";
    const MERCURE_TOPIC = "/api/module_statuses";
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["module_status:read", "module_history:read"])]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255, unique: true)]
    #[Assert\Length(max: 255)]
    #[Assert\NotBlank]
    #[Groups(["module_status:read", "module_status:write", "module_history:read"])]
    private string $name;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    #[Assert\Length(max: 255)]
    #[Groups(["module_status:read", "module_status:write", "module_history:read"])]
    private ?string $color = null;

    #[ORM\Column(type: "string", length: 255, unique: true, nullable: true)]
    #[Assert\Length(max: 255)]
    #[Groups(["module_status:read", "module_status:write"])]
    private string $slug;

    #[ORM\Column(type: "datetime")]
    #[Groups(["module_status:read"])]
    private ?\DateTimeInterface $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;
        return $this;

    }

    #[ORM\PrePersist]
    public function updatedTimestamps(): void
    {
        if ($this->getCreatedAt() === null) {
            $this->createdAt = new \DateTime('now');
        }
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(?string $color): self
    {
        $this->color = $color;
        return $this;
    }
}
