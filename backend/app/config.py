from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    meiqia_app_id: str = ""
    meiqia_app_secret: str = ""
    meiqia_api_host: str = "https://api.meiqia.com"
    jwt_secret: str = "change-me-in-production"

    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8")


settings = Settings()
