<?php


declare(strict_types=1);

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model;
use ApiPlatform\OpenApi\OpenApi;

final class JwtDecorator implements OpenApiFactoryInterface
{
    public function __construct(
        private OpenApiFactoryInterface $decorated
    )
    {
    }

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = ($this->decorated)($context);
        $schemas = $openApi->getComponents()->getSchemas();

        $schemas['Token'] = new \ArrayObject([
            'type' => 'object',
            'properties' => [
                'token' => [
                    'type' => 'string',
                    'readOnly' => true,
                ],
                'refresh_token' => [
                    'type' => 'string',
                    'readOnly' => true,
                ],
                'user' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => [
                            'type' => 'string'
                        ],
                        'firstName' => [
                            'type' => 'string'
                        ],
                        'lastName' => [
                            'type' => 'string'
                        ],
                        'email' => [
                            'type' => 'string'
                        ],
                        'avatar' => [
                            'type' => 'string'
                        ],
                        'roles' => [
                            'type' => 'array',
                            'items' => [
                                'type' => 'string'
                            ]
                        ],
                    ]
                ],
            ],
        ]);
        $schemas['BearerAuth'] = new \ArrayObject([
            'type' => 'https',
            'scheme' => 'bearer',
            'bearerFormat' => 'JWT'
        ]);
        $schemas['Credentials'] = new \ArrayObject([
            'type' => 'object',
            'properties' => [
                'email' => [
                    'type' => 'string',
                    'example' => 'johndoe@example.com',
                ],
                'password' => [
                    'type' => 'string',
                    'example' => 'apassword',
                ],
            ],
        ]);

        $schemas['Refresh'] = new \ArrayObject([
            'type' => 'object',
            'properties' => [
                'refresh_token' => [
                    'type' => 'string',
                ],
            ],
        ]);

        $pathItem = new Model\PathItem(
            ref: 'JWT Token',
            post: new Model\Operation(
                operationId: 'postCredentialsItem',
                tags: ['Token'],
                responses: [
                    '200' => [
                        'description' => 'Get JWT token and refresh token',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    '$ref' => '#/components/schemas/Token',
                                ],
                            ],
                        ],
                    ],
                ],
                summary: 'Get JWT token to login.',
                requestBody: new Model\RequestBody(
                    description: 'Generate new JWT Token',
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                '$ref' => '#/components/schemas/Credentials',
                            ],
                        ],
                    ]),
                ),
            ),
        );

        $pathItemRefresh = new Model\PathItem(
            ref: 'JWT Token',
            post: new Model\Operation(
                operationId: 'postCredentialsRefreshItem',
                tags: ['Token'],
                responses: [
                    '200' => [
                        'description' => 'Get JWT token and refresh token',
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    '$ref' => '#/components/schemas/Token',
                                ],
                            ],
                        ],
                    ],
                ],
                summary: 'Refresh JWT token',
                requestBody: new Model\RequestBody(
                    description: 'Generate new JWT Token',
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                '$ref' => '#/components/schemas/Refresh',
                            ],
                        ],
                    ]),
                ),
            ),
        );

        $pathItemLogout = new Model\PathItem(
            ref: 'JWT Token',
            get: new Model\Operation(
                operationId: 'postCredentialsRefreshItem',
                tags: ['Token'],
                responses: [
                    '200' => [
                        'description' => 'Logout success',
                    ],
                ],
                summary: 'To Logout',

            ),
        );

        $openApi->getPaths()->addPath('/api/login', $pathItem);
        $openApi->getPaths()->addPath('/api/token/refresh', $pathItemRefresh);
        $openApi->getPaths()->addPath('/api/logout', $pathItemLogout);

        return $openApi;
    }
}
