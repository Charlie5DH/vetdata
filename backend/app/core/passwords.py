import bcrypt


# bcrypt only hashes the first 72 bytes of input — silently truncating here
# matches what every other bcrypt-based stack does and keeps verification
# deterministic for both new and previously-hashed (passlib-era) passwords.
_MAX_BCRYPT_BYTES = 72


def _prepare(plain_password: str) -> bytes:
    encoded = plain_password.encode("utf-8")
    return encoded[:_MAX_BCRYPT_BYTES]


def hash_password(plain_password: str) -> str:
    return bcrypt.hashpw(_prepare(plain_password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(_prepare(plain_password), hashed_password.encode("utf-8"))
    except ValueError:
        # Malformed hash on disk — treat as auth failure rather than crashing.
        return False
