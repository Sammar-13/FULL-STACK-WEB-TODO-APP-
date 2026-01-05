"""User service with business logic (Task 02-030)."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ..db.models import User
from ..security import hash_password, verify_password


async def get_user_by_id(session: AsyncSession, user_id: UUID) -> Optional[User]:
    """Retrieve user by ID (Task 02-030).

    Args:
        session: Database session
        user_id: UUID of user to retrieve

    Returns:
        User object if found, None otherwise
    """
    if not user_id:
        return None

    return await session.get(User, user_id)


async def get_user_by_email(session: AsyncSession, email: str) -> Optional[User]:
    """Retrieve user by email (Task 02-030).

    Args:
        session: Database session
        email: Email address to search for

    Returns:
        User object if found, None otherwise
    """
    if not email:
        return None

    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    return result.scalars().first()


async def update_user(
    session: AsyncSession,
    user_id: UUID,
    updates: dict,
) -> Optional[User]:
    """Update user profile information (Task 02-030).

    Args:
        session: Database session
        user_id: UUID of user to update
        updates: Dictionary of fields to update

    Returns:
        Updated User object if found, None otherwise

    Raises:
        ValueError: If updates are invalid
    """
    user = await get_user_by_id(session, user_id)
    if not user:
        return None

    # Update allowed fields only
    allowed_fields = {"full_name", "avatar_url"}
    for field, value in updates.items():
        if field not in allowed_fields:
            raise ValueError(f"Cannot update field: {field}")

        if value is not None:
            setattr(user, field, value)

    # Update the updated_at timestamp
    user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return user


async def change_password(
    session: AsyncSession,
    user_id: UUID,
    old_password: str,
    new_password: str,
) -> bool:
    """Change user password (Task 02-030).

    Args:
        session: Database session
        user_id: UUID of user
        old_password: Current password for verification
        new_password: New password to set

    Returns:
        True if password changed successfully

    Raises:
        ValueError: If old password is incorrect or new password is invalid
    """
    if not user_id or not old_password or not new_password:
        raise ValueError("User ID and both passwords are required")

    if len(new_password) < 8:
        raise ValueError("New password must be at least 8 characters")

    if new_password == old_password:
        raise ValueError("New password must be different from old password")

    user = await get_user_by_id(session, user_id)
    if not user:
        raise ValueError("User not found")

    # Verify old password
    if not verify_password(old_password, user.password_hash):
        raise ValueError("Incorrect current password")

    # Hash and set new password
    user.password_hash = hash_password(new_password)
    user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return True