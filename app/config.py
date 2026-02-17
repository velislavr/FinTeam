from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = ""
    orchestrator_model: str = "gpt-5.1"
    quant_model: str = "gpt-5-mini"

    # Sentiment (OpenAI)
    sentiment_model: str = "gpt-5-mini"

    # Alpaca
    alpaca_api_key: str = ""
    alpaca_secret_key: str = ""
    alpaca_base_url: str = "https://paper-api.alpaca.markets"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Email (Resend)
    resend_api_key: str = ""
    notify_email: str = ""

    # Limits
    cache_ttl_seconds: int = 300
    max_input_tokens: int = 4000
    default_key_limit: int = 5

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
