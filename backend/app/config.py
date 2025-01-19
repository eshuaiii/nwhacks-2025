class Config:
    SECRET_KEY = 'your-secret-key'
    DEBUG = False
    TESTING = False
    ENV = 'production'

class DevelopmentConfig(Config):
    DEBUG = True
    ENV = 'development'

class TestingConfig(Config):
    TESTING = True
    ENV = 'testing'

class ProductionConfig(Config):
    pass