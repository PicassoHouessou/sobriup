<?php


namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
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
use ApiPlatform\Metadata\QueryParameter;
use App\Repository\LogRepository;
use Doctrine\ORM\Mapping as ORM;
use Monolog\Logger;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;


#[ApiResource(
    operations: [
        new Get(security: 'is_granted(\'view\',object)'),
        new Delete(security: 'is_granted(\'edit\',object)'),
    ],
    normalizationContext: ['groups' => ['log:read']],
    denormalizationContext: ['groups' => ['log:write']], paginationClientEnabled: true,
    paginationClientItemsPerPage: true, paginationEnabled: true,
    security: 'is_granted(\'ROLE_ADMIN\')',
)]
#[GetCollection(
    parameters: [
        'id' => new QueryParameter( filter: new ExactFilter()),
        'IP' => new QueryParameter( filter: new PartialSearchFilter()),
        'userFirstName' => new QueryParameter( filter: new PartialSearchFilter()),
        'userLastName' => new QueryParameter( filter: new PartialSearchFilter()),
        'uri' => new QueryParameter( filter: new PartialSearchFilter()),
        'error' => new QueryParameter( filter: new BooleanFilter()),
        'order[:property]' => new QueryParameter(filter: new OrderFilter(), properties: ['IP', "error", 'userFirstName', 'userLastName', 'uri', 'createdAt']),
        'createdAt' => new QueryParameter( filter: new DateFilter(), filterContext: ['include_nulls' => true]),
        'search' => new QueryParameter(
            filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
            properties: ['IP','userFirstName','userLastName', 'uri','error']
        ),
    ],
)]
#[ORM\Entity(repositoryClass: LogRepository::class)]
 class Log
{
    public static $levelNameWithoutError = [
        Logger::DEBUG => 'DEBUG',
        Logger::INFO => 'INFO',
        Logger::NOTICE => 'NOTICE',
    ];
    public static $levelNameWithError = [
        Logger::WARNING => 'WARNING',
        Logger::ERROR => 'ERROR',
        Logger::CRITICAL => 'CRITICAL',
        Logger::ALERT => 'ALERT',
        Logger::EMERGENCY => 'EMERGENCY',
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    #[Groups(["log:read"])]
    private $id;

    #[ORM\Column(type: "text", nullable: true)]
    private $message;

    #[ORM\Column(type: "array")]
    private $context = [];

    #[ORM\Column(type: "smallint", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    private int $level;

    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $levelName;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(["log:write", "log:read"])]
    private $createdAt;

    #[ORM\Column(type: 'uuid', nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Uuid(versions: [4])]
    private $userId = null;

    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $userEmail;

    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $userFirstName;

    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $userLastName;


    #[ORM\Column(type: "json")]
    #[Groups(["log:write", "log:read"])]
    private $userRoles = [];


    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $clientIp;

    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $clientPort;

    #[ORM\Column(type: "text", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    private ?string $uri;

    #[ORM\Column(type: "text", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    private ?string $queryString;


    #[ORM\Column(type: "string", nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $method;

    #[ORM\Column(type: "json",)]
    #[Groups(["log:write", "log:read"])]
    private $request = [];

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private ?string $IP;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(["log:write", "log:read"])]
    #[Assert\Sequentially([
        new Assert\Length(max: 250)
    ])]
    private $action = "apilog";

    #[ORM\Column(type: 'boolean')]
    #[Groups(["log:write", "log:read"])]
    private bool $error = false;


    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Get the value of context
     */
    public function getContext(): array
    {
        return $this->context;
    }

    /**
     * Set the value of context
     *
     * @return  self
     */
    public function setContext(array $context): self
    {
        $this->context = $context;

        return $this;
    }

    /**
     * Get the value of message
     */
    public function getMessage(): ?string
    {
        return $this->message;
    }

    /**
     * Set the value of message
     *
     * @return  self
     */
    public function setMessage(?string $message): self
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get the value of levelName
     */
    public function getLevelName(): ?string
    {
        return $this->levelName;
    }

    /**
     * Set the value of levelName
     *
     * @return  self
     */
    public function setLevelName(?string $levelName): self
    {
        $this->levelName = $levelName;

        return $this;
    }

    /**
     * Get the value of level
     */
    public function getLevel(): ?int
    {
        return $this->level;
    }

    /**
     * Set the value of level
     *
     * @return  self
     */
    public function setLevel(?int $level): self
    {
        $this->level = $level;

        return $this;
    }


    public function getLog(): array
    {
        return $this->log;
    }

    public function setLog(array $log): self
    {
        $this->log = $log;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUserId()
    {
        return $this->userId;
    }

    public function setUserId($userId): self
    {
        $this->userId = $userId;

        return $this;
    }

    public function getIP(): ?string
    {
        return $this->IP;
    }


    public function setIP(?string $IP): self
    {
        $this->IP = $IP;

        return $this;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(?string $action): self
    {
        $this->action = $action;

        return $this;
    }

    public function getUserFirstName(): ?string
    {
        return $this->userFirstName;
    }

    public function setUserFirstName(?string $userFirstName): self
    {
        $this->userFirstName = $userFirstName;

        return $this;
    }

    public function getUserLastName(): ?string
    {
        return $this->userLastName;
    }

    public function setUserLastName(?string $userLastName): self
    {
        $this->userLastName = $userLastName;

        return $this;
    }

    public function getUserEmail(): ?string
    {
        return $this->userEmail;
    }

    /**
     * Set the value of userEmail
     *
     * @param string $userEmail
     *
     * @return self
     */
    public function setUserEmail(?string $userEmail): self
    {
        $this->userEmail = $userEmail;

        return $this;
    }

    /**
     * Get the value of userRoles
     */
    public function getUserRoles()
    {
        return $this->userRoles;
    }

    /**
     * Set the value of userRoles
     */
    public function setUserRoles($userRoles): self
    {
        $this->userRoles = $userRoles;

        return $this;
    }


    /**
     * Get the value of clientIp
     *
     * @return string
     */
    public function getClientIp(): ?string
    {
        return $this->clientIp;
    }

    /**
     * Set the value of clientIp
     *
     * @param string $clientIp
     *
     * @return self
     */
    public function setClientIp(?string $clientIp): self
    {
        $this->clientIp = $clientIp;

        return $this;
    }

    public function getClientPort(): ?string
    {
        return $this->clientPort;
    }


    public function setClientPort(?string $clientPort): self
    {
        $this->clientPort = $clientPort;

        return $this;
    }

    public function getUri(): ?string
    {
        return $this->uri;
    }

    public function setUri(?string $uri): self
    {
        $this->uri = $uri;

        return $this;
    }


    public function getQueryString(): ?string
    {
        return $this->queryString;
    }

    public function setQueryString(?string $queryString): self
    {
        $this->queryString = $queryString;

        return $this;
    }

    public function getMethod(): ?string
    {
        return $this->method;
    }

    public function setMethod(?string $method): self
    {
        $this->method = $method;

        return $this;
    }

    public function getRequest(): ?array
    {
        return $this->request;
    }

    public function setRequest(?array $request): self
    {
        $this->request = $request;

        return $this;
    }

    public function getError(): bool
    {
        return $this->error;
    }

    public function setError(bool $error): self
    {
        $this->error = $error;

        return $this;
    }
}
