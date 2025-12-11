<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ModuleHistoryRepository;
use App\State\ModuleHistoryProcessor;
use Carbon\Carbon;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new GetCollection(),
        new Post(),
    ],
    normalizationContext: ['groups' => ['module_history:read']],
    denormalizationContext: ['groups' => ['module_history:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleHistoryProcessor::class,

)]
#[ApiFilter(filterClass: OrderFilter::class, properties: ['id', 'name', 'slug', 'createdAt'])]
#[ApiFilter(filterClass: SearchFilter::class, properties: ['id' => 'exact', 'value' => 'partial', 'module' => 'exact', 'status' => 'exact'])]
#[ApiFilter(DateFilter::class, properties: ['createdAt'])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: ModuleHistoryRepository::class)]
class ModuleHistory
{
    const READ = "module_history:read";
    const MERCURE_TOPIC = "/api/module_histories";
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["module_history:read"])]
    private ?int $id = null;


    #[ORM\ManyToOne(targetEntity: Module::class, inversedBy: "histories")]
    #[Groups(["module_history:read", "module_history:write"])]
    private ?Module $module = null;

    #[ORM\ManyToOne(targetEntity: ModuleStatus::class)]
    #[Groups(["module_history:read", "module_history:write"])]
    private ?ModuleStatus $status = null;

    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(["module_history:read", "module_history:write"])]
    private ?float $value = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["module_history:read"])]
    private ?\DateTimeInterface $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getModule(): ?Module
    {
        return $this->module;
    }

    public function setModule(?Module $module): self
    {
        $this->module = $module;
        return $this;
    }

    public function getStatus(): ?ModuleStatus
    {
        return $this->status;
    }

    public function setStatus(?ModuleStatus $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(?float $value): void
    {
        $this->value = $value;
    }


    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): ?self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    #[Groups(["module_history:read"])]
    public function getCreatedAtAgo(): string
    {
        if ($this->createdAt === null) {
            return "";
        }
        return Carbon::instance($this->createdAt)->diffForHumans();
    }

    #[ORM\PrePersist]
    public function updatedTimestamps(): void
    {
        if ($this->getCreatedAt() === null) {
            $this->createdAt = new \DateTime('now');
        }

    }
}
