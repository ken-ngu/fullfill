import os
from pathlib import Path


def _load_env_file(path: str) -> None:
    p = Path(path)
    if not p.exists():
        return
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


# Load .env.dev first (local overrides), then .env
_load_env_file(str(Path(__file__).parent.parent.parent / ".env.dev"))
_load_env_file(str(Path(__file__).parent.parent.parent / ".env"))


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://fullfill:fullfill@localhost:5432/fullfill")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me-in-production")
    jwt_expiry_hours: int = int(os.getenv("JWT_EXPIRY_HOURS", "8"))
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"


settings = Settings()
