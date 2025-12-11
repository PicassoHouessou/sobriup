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
use App\Repository\ModuleRepository;
use App\State\ModuleProcessor;
use Carbon\Carbon;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new GetCollection(parameters: [
            'search' => new QueryParameter(
                filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
                properties: ['name', 'description']
            ),
        ]),
        new Post(),
    ],
    normalizationContext: ['groups' => ['module:read']],
    denormalizationContext: ['groups' => ['module:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleProcessor::class,
)]
#[ApiFilter(filterClass: OrderFilter::class, properties: ['id', 'name', 'description', 'createdAt'])]
#[ApiFilter(filterClass: SearchFilter::class, properties: ['id' => 'exact', 'name' => 'partial', 'description' => 'partial', 'type' => 'exact'])]
#[ApiFilter(DateFilter::class, properties: ['createdAt', 'updatedAt'])]
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

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["module:read", "module_history:read"])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(["module:read"])]
    private ?\DateTimeInterface $updatedAt = null;


    public function getId(): ?int
    {
        return $this->id;
    }

    #[ORM\OneToMany(targetEntity: ModuleHistory::class, mappedBy: "module", cascade: ["remove"])]
    private Collection $histories;

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


}
