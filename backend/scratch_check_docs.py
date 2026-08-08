import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.document import Document

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Document))
        docs = result.scalars().all()
        print(f"Total documents in DB: {len(docs)}")
        for d in docs:
            print(f"ID: {d.id} | Filename: '{d.filename}' | Status: {d.status} | Chunks: {d.chunk_count} | Error: {d.error_message}")

if __name__ == "__main__":
    asyncio.run(main())
