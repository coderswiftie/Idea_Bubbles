from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Category, Idea, User
from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

DEFAULT_CATEGORIES = [
    {"name": "Startups & Business", "color_hex": "#F43F5E", "icon": "briefcase"},
    {"name": "Websites & Software", "color_hex": "#38BDF8", "icon": "code"},
    {"name": "AI & Technology", "color_hex": "#A855F7", "icon": "cpu"},
    {"name": "Research & Learning", "color_hex": "#2DD4BF", "icon": "book-open"},
    {"name": "Writing & Literature", "color_hex": "#FBBF24", "icon": "feather"},
    {"name": "Art & Design", "color_hex": "#FB7185", "icon": "palette"},
    {"name": "Personal Projects", "color_hex": "#818CF8", "icon": "sparkles"},
    {"name": "Random Thoughts", "color_hex": "#94A3B8", "icon": "cloud"},
]

def seed_default_categories(db: Session, user_id: str):
    """Ensures a user has the default categories populated."""
    count = db.query(Category).filter(
        (Category.user_id == user_id) | (Category.is_default == True)
    ).count()
    if count == 0:
        for cat_data in DEFAULT_CATEGORIES:
            cat = Category(
                user_id=user_id,
                name=cat_data["name"],
                color_hex=cat_data["color_hex"],
                icon=cat_data["icon"],
                is_default=True
            )
            db.add(cat)
        db.commit()

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_default_categories(db, current_user.id)
    categories = db.query(Category).filter(
        (Category.user_id == current_user.id) | (Category.user_id == None)
    ).order_by(Category.created_at).all()

    # Calculate idea count per category
    result = []
    for cat in categories:
        idea_count = db.query(Idea).filter(
            Idea.user_id == current_user.id,
            Idea.category_id == cat.id,
            Idea.is_archived == False
        ).count()
        res_cat = CategoryResponse.model_validate(cat)
        res_cat.idea_count = idea_count
        result.append(res_cat)
    return result

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat = Category(
        user_id=current_user.id,
        name=cat_in.name,
        color_hex=cat_in.color_hex,
        icon=cat_in.icon or "sparkles",
        is_default=False
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    res = CategoryResponse.model_validate(cat)
    res.idea_count = 0
    return res

@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")

    if cat_in.name is not None:
        cat.name = cat_in.name
    if cat_in.color_hex is not None:
        cat.color_hex = cat_in.color_hex
    if cat_in.icon is not None:
        cat.icon = cat_in.icon

    db.commit()
    db.refresh(cat)
    return CategoryResponse.model_validate(cat)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cat = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")

    # Unlink ideas from this category
    db.query(Idea).filter(Idea.category_id == category_id).update({"category_id": None})
    db.delete(cat)
    db.commit()
    return None
