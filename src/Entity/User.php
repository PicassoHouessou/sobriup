<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;use ApiPlatform\Doctrine\Common\Filter\DateFilterInterface;
use ApiPlatform\Doctrine\Orm\Filter\ExactFilter;
use ApiPlatform\Doctrine\Orm\Filter\FreeTextQueryFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrFilter;
use ApiPlatform\Doctrine\Orm\Filter\PartialSearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\QueryParameter;
use App\Controller\ChangePasswordController;
use App\Controller\EditAvatarController;
use App\Repository\UserRepository;
use App\State\UserProcessor;
use Carbon\Carbon;
use Doctrine\ORM\Mapping as ORM;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Get(security: 'is_granted(\'view\',object)'),
        new Put(security: 'is_granted(\'edit\',object)'),
        new Delete(security: 'is_granted(\'edit\',object)'),
        new Patch,
        new Put(
            uriTemplate: '/users/password/update/{id}',
            requirements: ['id' => '.+', '_method' => 'PUT'],
            controller: ChangePasswordController::class,
            openapi: new \ApiPlatform\OpenApi\Model\Operation(
                summary : 'Change the password of User Resource',
                requestBody: new \ApiPlatform\OpenApi\Model\RequestBody(
                    description : 'Change the password of User Resource',
                    content :new \ArrayObject( [
                        'application/json' => [
                            'schema' => [
                                '' => 'object',
                                'properties' => [
                                    'oldPassword' => ['type' => 'string'],
                                    'newPassword' => ['type' => 'string'],
                                    'confirmPassword' => ['type' => 'string']
                                ]
                            ]
                        ]
                    ])
                    ))
            ,
            security: 'is_granted(\'edit\',object)'
        ),
        new Post(
            uriTemplate: '/users/avatar/{id}',
            requirements: ['id' => '.+', '_method' => 'POST'],
            controller: EditAvatarController::class,
             openapi: new \ApiPlatform\OpenApi\Model\Operation(
                summary: 'Add an avatar to User ressource',
                requestBody: new \ApiPlatform\OpenApi\Model\RequestBody(
                    description: 'Add an avatar to User ressource',
                    content :new \ArrayObject( [
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'avatar' => [
                                        'type' => 'string',
                                        'format' => 'binary'
                                    ]
                                ]
                            ]
                        ]
                    ]))
            ),
            security: 'is_granted(\'edit\',object)',
            deserialize: false
        ),

        new Post(),
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']],
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationEnabled: true,
    processor: UserProcessor::class,
    extraProperties: [
        'standard_put' => false,
    ]
)]
#[GetCollection(parameters: [
    'id' => new QueryParameter( filter: new ExactFilter()),
    'firstName' => new QueryParameter( filter: new PartialSearchFilter()),
    'lastName' => new QueryParameter( filter: new PartialSearchFilter()),
    'email' => new QueryParameter( filter: new PartialSearchFilter()),
    'roles' => new QueryParameter( filter: new PartialSearchFilter()),
    'slug' => new QueryParameter(filter: new ExactFilter()),
    'order[:property]' => new QueryParameter(filter: new OrderFilter(), properties: ['id', 'email', 'firstName', 'lastName', 'roles', 'createdAt', 'updatedAt']),
    'createdAt' => new QueryParameter( filter: new DateFilter(), filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'updatedAt' => new QueryParameter( filter: new DateFilter(), filterContext: DateFilterInterface::INCLUDE_NULL_BEFORE_AND_AFTER),
    'search' => new QueryParameter(
        filter: new FreeTextQueryFilter(new OrFilter(new PartialSearchFilter())),
        properties: ['firstName', 'lastName','email']
    ),

])]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity("email")]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface, JWTUserInterface
{
    const READ = "user:read";
    const MERCURE_TOPIC = "/api/users";
    public const ROLE_USER = 'ROLE_USER';
    public const ROLE_TECHNICIAN = 'ROLE_TECHNICIAN';
    public const ROLE_MANAGER = 'ROLE_MANAGER';
    public const ROLE_ADMIN = 'ROLE_ADMIN';
    public const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(["user:read"])]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\Sequentially([
        new Assert\NotBlank,
        new Assert\Email,
        new Assert\Length(max: 170)
    ])]
    #[Groups(["user:read", "user:write"])]
    private ?string $email = null;


    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(["user:read", "user:write"])]
    #[Assert\Sequentially([
        new Assert\NotBlank,
        new Assert\Length(max: 250)

    ])]
    private ?string $firstName = null;
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(["user:read", "user:write"])]
    #[Assert\Sequentially([
        new Assert\NotBlank,
        new Assert\Length(max: 250)
    ])]
    private ?string $lastName = null;

    #[ApiProperty(iris: ['https://schema.org/image'], openapiContext: ['type' => 'string'])]
    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(["user:read", "user:avatar"])]
    private $avatar;

    #[Groups(["user:read"])]
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isVerified = false;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(["user:read"])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column(type: 'string', length: 255, nullable: false)]
    #[Groups(["user:read", "user:write"])]
    #[Assert\Sequentially([
        new Assert\NotBlank,
        new Assert\Length(max: 250)
    ])]
    private ?string $password = null;

    #[ORM\Column(type: "datetime")]
    #[Groups(["user:read"])]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: "datetime")]
    #[Groups(["user:read"])]
    private ?\DateTimeInterface $updatedAt = null;

    public static function createFromPayload($id, array $payload): JWTUserInterface
    {
        $user = new self;

        //$user->setId(Uuid::fromString($id));
        $user->setId((int)$id);
        $user->setEmail($payload['username'] ?? '');
        $user->setRoles($payload['roles']);

        return $user;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string)$this->email;
    }

    /**
     * @return list<string>
     * @see UserInterface
     *
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(?string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }


    public function getIsVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): self
    {
        $this->isVerified = $isVerified;
        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
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

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    #[Groups(["user:read"])]
    public function getCreatedAtAgo(): string
    {
        if ($this->createdAt === null) {
            return "";
        }
        return Carbon::instance($this->createdAt)->diffForHumans();
    }

    #[Groups(["user:read"])]
    public function getUpdatedAtAgo(): string
    {
        if ($this->updatedAt === null) {
            return "";
        }
        return Carbon::instance($this->updatedAt)->diffForHumans();
    }
}
