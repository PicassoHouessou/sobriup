<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
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
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use App\Repository\ModuleRepository;
use App\State\ModuleProcessor;
use Carbon\Carbon;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Doctrine\Common\Filter\DateFilterInterface;
#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new Post(),
    ],
    normalizationContext: ['groups' => ['module:read']],
    denormalizationContext: ['groups' => ['module:write']],
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
#[ORM\Entity(repositoryClass: ModuleRepository::class)]
class Module
{
    const READ = "module:read";
    const MERCURE_TOPIC = "/api/modules";
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["module:read", "module_history:read"])]
    private ?int $id = null;

    #[ORM\Column(type: Types::STRING, length: 255)]
    #[Assert\Length(max: 250)]
    #[Assert\NotBlank]
    #[Groups(["module:read", "module:write", "module_history:read"])]
    private string $name;

    #[ORM\Column(type: Types::TEXT, length: 5000, nullable: true)]
    #[Assert\Length(max: 5000)]
    #[Groups(["module:read", "module:write", "module_history:read"])]
    private ?string $description;

    #[ORM\ManyToOne(targetEntity: ModuleType::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank]
    #[Groups(["module:read", "module:write", "module_history:read"])]
    private ?ModuleType $type = null;

    #[ORM\ManyToOne(targetEntity: Space::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(["module:read", "module:write", "module_history:read"])]
    private ?Space $space = null;

    /**
     * Seuil à ne pas dépasser sinon on peut dire que le module n'est pas dans un bon état (état critique))
     * @var float|null
     */
    #[ORM\Column(type: Types::FLOAT, nullable: true)]
    #[Groups(["module:read", "module:write"])]
    private ?float $threshold = null;


    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["module:read", "module_history:read"])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["module:read"])]
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * Prochaine date de maintenance
     * @var \DateTimeInterface|null
     */
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(["module:read", "module:write"])]
    private ?\DateTimeInterface $maintenanceAt = null;



    public function getId(): ?int
    {
        return $this->id;
    }

    #[ORM\OneToMany(targetEntity: ModuleHistory::class, mappedBy: "module", cascade: ["remove"])]
    private Collection $histories;

    #[ORM\Column(nullable: true)]
    private ?int $uptime = null;

    public function __construct()
    {
        $this->histories = new ArrayCollection();
    }

    /**
     * @return Collection|ModuleHistory[]
     */
    public function getHistories(): Collection
    {
        return $this->histories;
    }

    public function addHistory(ModuleHistory $history): self
    {
        if (!$this->histories->contains($history)) {
            $this->histories[] = $history;
            $history->setModule($this);
        }

        return $this;
    }

    public function removeHistory(ModuleHistory $history): self
    {
        if ($this->histories->removeElement($history)) {
            // set the owning side to null (unless already changed)
            if ($history->getModule() === $this) {
                $history->setModule(null);
            }
        }

        return $this;
    }

    public function getName(): string
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

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }

    public function getType(): ?ModuleType
    {
        return $this->type;
    }

    public function setType(?ModuleType $type): self
    {
        $this->type = $type;
        return $this;
    }
    public function getSpace(): ?Space
    {
        return $this->space;
    }

    public function setSpace(?Space $space): self
    {
        $this->space = $space;
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

    #[Groups(["module:read", "module_history:read"])]
    public function getCreatedAtAgo(): string
    {
        if ($this->createdAt === null) {
            return "";
        }
        return Carbon::instance($this->createdAt)->diffForHumans();
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getUptime(): ?int
    {
        return $this->uptime;
    }

    public function setUptime(?int $uptime): static
    {
        $this->uptime = $uptime;

        return $this;
    }

    #[Groups(["module:read"])]
    public function getUptimeHuman(): ?string
    {
        if (!$this->uptime) return null;
        return \Carbon\CarbonInterval::seconds($this->uptime)->cascade()->forHumans();
    }

    public function getMaintenanceAt(): ?\DateTimeInterface
    {
        return $this->maintenanceAt;
    }

    public function setMaintenanceAt(?\DateTimeInterface $maintenanceAt): self
    {
        $this->maintenanceAt = $maintenanceAt;
        return $this;
    }

    public function getThreshold(): ?float
    {
        return $this->threshold;
    }

    public function setThreshold(?float $threshold): self
    {
        $this->threshold = $threshold;
        return $this;
    }


}
