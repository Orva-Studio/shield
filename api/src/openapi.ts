const openAPISpec = {
  openapi: '3.1.0',
  info: {
    title: 'ShieldTap API',
    version: '1.0.0',
    description: 'API for ShieldTap - a faith-centered app for tracking resistance to temptations'
  },
  servers: [
    {
      url: 'http://localhost:8787',
      description: 'Local development server'
    }
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID (from Cloudflare Access)'
          },
          email: {
            type: 'string',
            description: 'User email address',
            format: 'email'
          },
          created_at: {
            type: 'integer',
            description: 'Unix timestamp when user was created'
          }
        },
        required: ['id', 'email', 'created_at']
      },
      Tap: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Tap record ID'
          },
          user_id: {
            type: 'string',
            description: 'User ID who created this tap'
          },
          type: {
            type: 'string',
            enum: ['resist', 'yield'],
            description: 'Type of tap: resist (successful resistance) or yield (gave in to temptation)'
          },
          category: {
            type: 'string',
            nullable: true,
            description: 'Optional category of temptation (e.g., "social media", "sugar", "procrastination")'
          },
          timestamp: {
            type: 'integer',
            description: 'Unix timestamp when the tap occurred'
          },
          created_at: {
            type: 'integer',
            description: 'Unix timestamp when the record was created'
          }
        },
        required: ['id', 'user_id', 'type', 'timestamp', 'created_at']
      },
      CreateTapInput: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['resist', 'yield'],
            description: 'Type of tap'
          },
          category: {
            type: 'string',
            description: 'Optional category of temptation'
          },
          timestamp: {
            type: 'integer',
            description: 'Optional Unix timestamp (defaults to current time if not provided)'
          }
        },
        required: ['type']
      },
      TapStats: {
        type: 'object',
        properties: {
          total_resists: {
            type: 'integer',
            description: 'Total number of resist taps'
          },
          total_yields: {
            type: 'integer',
            description: 'Total number of yield taps'
          },
          current_streak: {
            type: 'integer',
            description: 'Current streak of consecutive days with only resist taps'
          },
          last_tap_date: {
            type: 'string',
            nullable: true,
            description: 'Date of the last tap in YYYY-MM-DD format'
          }
        },
        required: ['total_resists', 'total_yields', 'current_streak', 'last_tap_date']
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          }
        },
        required: ['error']
      }
    },
    securitySchemes: {
      CloudflareAccess: {
        type: 'http',
        scheme: 'bearer',
        description: 'Cloudflare Access JWT token. In production, include the token in the cf-access-jwt-assertion header. For local development with DEV_MODE=true, auth is bypassed automatically.'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the API is running. No authentication required.',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-07T12:00:00.000Z'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/me': {
      get: {
        summary: 'Get current user',
        description: 'Returns the authenticated user\'s profile information. Creates user record if it doesn\'t exist.',
        tags: ['Users'],
        security: [{ CloudflareAccess: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                },
                example: {
                  user: {
                    id: 'dev-user-id',
                    email: 'dev@example.com',
                    created_at: 1704624000
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Missing required CF Access JWT'
                }
              }
            }
          }
        }
      }
    },
    '/api/taps': {
      post: {
        summary: 'Create tap',
        description: 'Records a new tap (resist or yield) for the authenticated user. Optionally categorize the temptation type.',
        tags: ['Taps'],
        security: [{ CloudflareAccess: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTapInput'
              },
              examples: {
                resistSocialMedia: {
                  summary: 'Resisted social media temptation',
                  value: {
                    type: 'resist',
                    category: 'social media'
                  }
                },
                yieldSugar: {
                  summary: 'Yielded to sugar temptation',
                  value: {
                    type: 'yield',
                    category: 'sugar'
                  }
                },
                resistProcrastination: {
                  summary: 'Resisted procrastination with custom timestamp',
                  value: {
                    type: 'resist',
                    category: 'procrastination',
                    timestamp: 1704624000
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Tap created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tap: {
                      $ref: '#/components/schemas/Tap'
                    }
                  }
                },
                example: {
                  tap: {
                    id: 1,
                    user_id: 'dev-user-id',
                    type: 'resist',
                    category: 'social media',
                    timestamp: 1704624000,
                    created_at: 1704624000
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  error: 'Invalid tap type. Must be "resist" or "yield".'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      get: {
        summary: 'List taps',
        description: 'Returns the authenticated user\'s tap history with optional date filtering and pagination.',
        tags: ['Taps'],
        security: [{ CloudflareAccess: [] }],
        parameters: [
          {
            name: 'from',
            in: 'query',
            description: 'Filter taps after this Unix timestamp',
            schema: {
              type: 'integer'
            },
            example: 1704067200
          },
          {
            name: 'to',
            in: 'query',
            description: 'Filter taps before this Unix timestamp',
            schema: {
              type: 'integer'
            },
            example: 1704672000
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of taps to return (default: 100)',
            schema: {
              type: 'integer',
              default: 100
            },
            example: 10
          }
        ],
        responses: {
          '200': {
            description: 'List of taps',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    taps: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Tap'
                      }
                    }
                  }
                },
                example: {
                  taps: [
                    {
                      id: 5,
                      user_id: 'dev-user-id',
                      type: 'resist',
                      category: 'social media',
                      timestamp: 1704671000,
                      created_at: 1704671000
                    },
                    {
                      id: 4,
                      user_id: 'dev-user-id',
                      type: 'yield',
                      category: 'sugar',
                      timestamp: 1704660000,
                      created_at: 1704660000
                    },
                    {
                      id: 3,
                      user_id: 'dev-user-id',
                      type: 'resist',
                      category: 'procrastination',
                      timestamp: 1704640000,
                      created_at: 1704640000
                    }
                  ]
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/taps/stats': {
      get: {
        summary: 'Get tap statistics',
        description: 'Returns aggregated statistics for the authenticated user\'s taps including resists, yields, and current streak.',
        tags: ['Taps'],
        security: [{ CloudflareAccess: [] }],
        responses: {
          '200': {
            description: 'Tap statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stats: {
                      $ref: '#/components/schemas/TapStats'
                    }
                  }
                },
                example: {
                  stats: {
                    total_resists: 25,
                    total_yields: 7,
                    current_streak: 3,
                    last_tap_date: '2024-01-07'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints'
    },
    {
      name: 'Taps',
      description: 'Tap recording and retrieval endpoints'
    }
  ]
};

export default openAPISpec;
