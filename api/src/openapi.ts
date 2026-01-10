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
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'User display name'
          },
          email: {
            type: 'string',
            description: 'User email address',
            format: 'email'
          },
          emailVerified: {
            type: 'boolean',
            description: 'Whether the email has been verified'
          },
          image: {
            type: 'string',
            nullable: true,
            description: 'User profile image URL'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the user was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the user was last updated'
          },
          onboardingCompleted: {
            type: 'boolean',
            description: 'Whether the user has completed onboarding'
          }
        },
        required: ['id', 'name', 'email', 'emailVerified', 'createdAt', 'updatedAt', 'onboardingCompleted']
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
      BetterAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'Session cookie set by Better Auth after authentication. Use /api/auth/* endpoints for signup, signin, and signout.'
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
    '/api/auth/sign-up/email': {
      post: {
        summary: 'Sign up with email',
        description: 'Create a new account with email and password. A verification email will be sent.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Display name'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address'
                  },
                  password: {
                    type: 'string',
                    description: 'Password (min 8 characters)'
                  }
                },
                required: ['name', 'email', 'password']
              },
              example: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'securepassword123'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Account created successfully'
          },
          '400': {
            description: 'Invalid input or email already exists'
          }
        }
      }
    },
    '/api/auth/sign-in/email': {
      post: {
        summary: 'Sign in with email',
        description: 'Authenticate with email and password. Sets session cookie on success.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  password: {
                    type: 'string'
                  }
                },
                required: ['email', 'password']
              },
              example: {
                email: 'john@example.com',
                password: 'securepassword123'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Signed in successfully'
          },
          '401': {
            description: 'Invalid credentials'
          }
        }
      }
    },
    '/api/auth/sign-in/social': {
      post: {
        summary: 'Sign in with social provider',
        description: 'Initiate OAuth flow with a social provider (e.g., Google).',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  provider: {
                    type: 'string',
                    enum: ['google'],
                    description: 'OAuth provider'
                  },
                  callbackURL: {
                    type: 'string',
                    description: 'URL to redirect after authentication'
                  }
                },
                required: ['provider']
              },
              example: {
                provider: 'google',
                callbackURL: 'http://localhost:3000/auth/callback'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Returns OAuth redirect URL'
          }
        }
      }
    },
    '/api/auth/sign-out': {
      post: {
        summary: 'Sign out',
        description: 'End the current session and clear the session cookie.',
        tags: ['Authentication'],
        security: [{ BetterAuth: [] }],
        responses: {
          '200': {
            description: 'Signed out successfully'
          }
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        description: 'Send a password reset email to the specified address.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email'
                  },
                  redirectTo: {
                    type: 'string',
                    description: 'URL to include in reset email'
                  }
                },
                required: ['email']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Reset email sent (if account exists)'
          }
        }
      }
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password',
        description: 'Set a new password using the reset token from email.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    description: 'Reset token from email'
                  },
                  newPassword: {
                    type: 'string',
                    description: 'New password'
                  }
                },
                required: ['token', 'newPassword']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Password reset successfully'
          },
          '400': {
            description: 'Invalid or expired token'
          }
        }
      }
    },
    '/api/auth/get-session': {
      get: {
        summary: 'Get current session',
        description: 'Returns the current session and user if authenticated.',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Session data (null if not authenticated)'
          }
        }
      }
    },
    '/api/me': {
      get: {
        summary: 'Get current user',
        description: 'Returns the authenticated user\'s profile information.',
        tags: ['Users'],
        security: [{ BetterAuth: [] }],
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
                    id: 'uuid-here',
                    name: 'John Doe',
                    email: 'john@example.com',
                    emailVerified: true,
                    image: null,
                    createdAt: '2024-01-07T12:00:00.000Z',
                    updatedAt: '2024-01-07T12:00:00.000Z',
                    onboardingCompleted: false
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
                  error: 'Unauthorized'
                }
              }
            }
          }
        }
      }
    },
    '/api/me/onboarding': {
      post: {
        summary: 'Complete onboarding',
        description: 'Marks the authenticated user as having completed onboarding.',
        tags: ['Users'],
        security: [{ BetterAuth: [] }],
        requestBody: {
          description: 'Empty request body'
        },
        responses: {
          '200': {
            description: 'Onboarding marked as complete',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    }
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
    },
    '/api/taps': {
      post: {
        summary: 'Create tap',
        description: 'Records a new tap (resist or yield) for the authenticated user. Optionally categorize the temptation type.',
        tags: ['Taps'],
        security: [{ BetterAuth: [] }],
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
                    user_id: 'uuid-here',
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
        security: [{ BetterAuth: [] }],
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
                      user_id: 'uuid-here',
                      type: 'resist',
                      category: 'social media',
                      timestamp: 1704671000,
                      created_at: 1704671000
                    },
                    {
                      id: 4,
                      user_id: 'uuid-here',
                      type: 'yield',
                      category: 'sugar',
                      timestamp: 1704660000,
                      created_at: 1704660000
                    },
                    {
                      id: 3,
                      user_id: 'uuid-here',
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
        security: [{ BetterAuth: [] }],
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
      name: 'Authentication',
      description: 'Better Auth authentication endpoints (signup, signin, signout, password reset)'
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
