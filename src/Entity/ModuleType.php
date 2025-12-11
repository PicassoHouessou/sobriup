<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\FreeTextQueryFilter;
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
use App\Filter\ModuleTypeSearchFilter;
use App\Repository\ModuleTypeRepository;
use App\State\ModuleTypeProcessor;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Delete(),
        new Patch,
        new Post(),
    ],
    normalizationContext: ['groups' => ['module_type:read']],
    denormalizationContext: ['groups' => ['module_type:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleTypeProcessor::class,
)]
#[GetCollection(
    parameters: [
        'search' => new QueryParameter(
            filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
            properties: ['name','description']
        ),
    ],
)]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity("name")]
#[ApiFilter(filterClass: OrderFilter::class, properties: ['id', 'name', 'description', 'unitOfMeasure', 'unitDescription', 'minValue', 'maxValue'])]
#[ApiFilter(filterClass: SearchFilter::class, properties: ['id' => 'exact', 'name' => 'partial', 'description' => 'partial', 'unitOfMeasure' => 'exact', 'unitDescription' => 'partial', 'minValue' => 'partial', 'maxValue' => 'partial'])]
#[ORM\Entity(repositoryClass: ModuleTypeRepository::class)]
class ModuleType
{
    const READ = "module_type:read";
    const MERCURE_TOPIC = "/api/module_types";
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["module_type:read", "module_type:write", "module:read", "module_history:read"])]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 250)]
    #[Groups(["module_type:read", "module_type:write", "module:read", "module_history:read"])]
    private string $name;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\Length(max: 5000)]
    #[Groups(["module_type:read", "module_type:write"])]
    private string $description;

    #[ORM\Column(type: Types::STRING, length: 50)]
    #[Assert\Length(max: 50)]
    #[Groups(["module_type:read", "module_type:write", "module_history:read"])]
    private string $unitOfMeasure;

    #[ORM\Column(type: Types::TEXT, length: 5000)]
    #[Assert\Length(max: 5000)]
    #[Groups(["module_type:read", "module_type:write", "module_history:read"])]
    private string $unitDescription;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(["module_type:read", "module_type:write"])]
    private ?float $minValue = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(["module_type:read", "module_type:write"])]
    private ?float $maxValue = null;

    #[ORM\Column(type: "datetime")]
    #[Groups(["module_type:read"])]
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

    public function getUnitOfMeasure(): string
    {
        return $this->unitOfMeasure;
    }

    public function setUnitOfMeasure(string $unitOfMeasure): self
    {
        $this->unitOfMeasure = $unitOfMeasure;
        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getUnitDescription(): string
    {
        return $this->unitDescription;
    }

    public function setUnitDescription(string $unitDescription): self
    {
        $this->unitDescription = $unitDescription;
        return $this;
    }

    public function getMinValue(): ?float
    {
        return $this->minValue;
    }

    public function setMinValue(?float $minValue): void
    {
        $this->minValue = $minValue;
    }

    public function getMaxValue(): ?float
    {
        return $this->maxValue;
    }

    public function setMaxValue(?float $maxValue): void
    {
        $this->maxValue = $maxValue;
    }


    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function updatedTimestamps(): void
    {
        if ($this->getCreatedAt() === null) {
            $this->createdAt = new \DateTime('now');
        }
    }

}
