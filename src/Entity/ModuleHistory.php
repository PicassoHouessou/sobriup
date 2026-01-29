<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\FreeTextQueryFilter;
use ApiPlatform\Doctrine\Orm\Filter\IriFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrFilter;
use ApiPlatform\Doctrine\Orm\Filter\PartialSearchFilter;
use ApiPlatform\Doctrine\Common\Filter\DateFilterInterface;
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
use App\Repository\ModuleHistoryRepository;
use App\State\ModuleHistoryProcessor;
use Carbon\Carbon;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Get(),
        new Put(),
        new Patch(),
        new Delete(),
        new Post(),
    ],
    normalizationContext: ['groups' => ['module_history:read']],
    denormalizationContext: ['groups' => ['module_history:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: ModuleHistoryProcessor::class,

)]

#[GetCollection(parameters: [
    'id' => new QueryParameter( filter: new ExactFilter()),
    'name' => new QueryParameter( filter: new PartialSearchFilter()),
    'slug' => new QueryParameter(filter: new ExactFilter()),
    'status' => new QueryParameter(filter: new IriFilter()),
    'order[:property]' => new QueryParameter(filter: new OrderFilter(), properties: ['id','name', 'slug', 'createdAt']),
    'createdAt' => new QueryParameter( filter: new DateFilter(),property: 'createdAt', filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'search' => new QueryParameter(
        filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
        properties: ['name', 'slug']
    ),

])]
#[ORM\Index(columns: ['created_at'], name: 'idx_module_history_created_at')]
//#[ApiFilter(filterClass: SearchFilter::class, properties: ['id' => 'exact', 'value' => 'partial', 'module' => 'exact', 'status' => 'exact'])]
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
    // Température mesurée réelle
    private ?float $measuredTemperature = null;

    #[ORM\Column(nullable: true)]
    private ?float $power = null;

    #[ORM\Column(nullable: true)]
    private ?float $flowRate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["module_history:read", "module_history:write"])]
    // Température cible (IA / consigne)
    private ?float $targetTemperature = null;

    #[ORM\Column(nullable: true)]
    #[Groups(["module_history:read", "module_history:write"])]
    // float (kWh sur l’intervalle)
    private ?float $energyConsumption = null;



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

    public function getMeasuredTemperature(): ?float
    {
        return $this->measuredTemperature;
    }

    public function setMeasuredTemperature(?float $measuredTemperature): static
    {
        $this->measuredTemperature = $measuredTemperature;
        return $this;
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

    public function getPower(): ?float
    {
        return $this->power;
    }

    public function setPower(?float $power): static
    {
        $this->power = $power;

        return $this;
    }

    public function getFlowRate(): ?float
    {
        return $this->flowRate;
    }

    public function setFlowRate(?float $flowRate): static
    {
        $this->flowRate = $flowRate;

        return $this;
    }

    public function getTargetTemperature(): ?float
    {
        return $this->targetTemperature;
    }

    public function setTargetTemperature(?float $targetTemperature): static
    {
        $this->targetTemperature = $targetTemperature;

        return $this;
    }

    public function getEnergyConsumption(): ?float
    {
        return $this->energyConsumption;
    }

    public function setEnergyConsumption(?float $energyConsumption): static
    {
        $this->energyConsumption = $energyConsumption;

        return $this;
    }

}
