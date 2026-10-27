import os
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    # Documents
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/json": ".json",
}

class StorageService:
    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int]:
        """
        Validates and safely saves an uploaded file to the local storage directory.
        Returns: (file_name, file_path, file_size)
        """
        # Validate MIME type
        content_type = file.content_type or "application/octet-stream"
        if content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{content_type}'. Allowed types: images, PDF, markdown, plain text."
            )

        # Read and check size
        content = await file.read()
        file_size = len(content)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # Generate unique, non-executable filename
        extension = ALLOWED_MIME_TYPES.get(content_type, ".bin")
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        target_path = os.path.join(self.upload_dir, unique_filename)

        with open(target_path, "wb") as f:
            f.write(content)

        # Reset cursor
        await file.seek(0)

        # File path saved relative for portability
        return file.filename or "unnamed_file", target_path, file_size

    def delete_file(self, file_path: str):
        """Removes a file from storage if it exists."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

storage_service = StorageService()
