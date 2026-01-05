"""User management API routes (Tasks 02-040, 02-041)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from ...database import get_session
from ...db.models import User
from ...schemas import UserProfile, UserUpdate
from ...services.user import change_password, update_user
from ..dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserProfile:
    """Get current user's profile (Task 02-040).

    Args:
        current_user: Currently authenticated user

    Returns:
        UserProfile with all user information
    """
    return UserProfile.model_validate(current_user)


@router.patch("/profile", response_model=UserProfile)
async def update_user_profile(
    request: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserProfile:
    """Update current user's profile (Task 02-040).

    Args:
        request: UpdateUser request with fields to update
        current_user: Currently authenticated user
        session: Database session

    Returns:
        Updated UserProfile

    Raises:
        HTTPException: 400 if validation fails, 404 if user not found
    """
    try:
        # Prepare update dictionary
        updates = {}
        if request.full_name is not None:
            updates["full_name"] = request.full_name
        if request.avatar_url is not None:
            updates["avatar_url"] = request.avatar_url

        if not updates:
            # Return current profile if no updates
            return UserProfile.model_validate(current_user)

        # Update user
        updated_user = await update_user(session, current_user.id, updates)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return UserProfile.model_validate(updated_user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.put("/password", response_model=dict)
async def change_user_password(
    request: dict,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Change user password (Task 02-041).

    Args:
        request: Dictionary with old_password and new_password
        current_user: Currently authenticated user
        session: Database session

    Returns:
        Success message

    Raises:
        HTTPException: 400 if validation fails, 401 if password incorrect
    """
    old_password = request.get("old_password")
    new_password = request.get("new_password")

    if not old_password or not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password and new password are required",
        )

    try:
        success = await change_password(
            session,
            current_user.id,
            old_password,
            new_password,
        )

        if success:
            return {"message": "Password changed successfully"}
    except ValueError as e:
        error_msg = str(e)
        if "Incorrect" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=error_msg,
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        ) from e
    except Exception as e:
        import traceback
        print(f"[ERROR] Change password failed: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password",
        )