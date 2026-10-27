"""
Seed script to populate a beautiful initial universe of ideas for Idea Bubbles.
Can be executed via: python seed.py
"""
import os
import sys

# Ensure current directory is on pythonpath
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, Category, Idea, IdeaNote, IdeaTask, Reference, IdeaConnection, Tag
from app.core.security import get_password_hash
from app.api.v1.categories import seed_default_categories

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check or create default user
        demo_email = "explorer@ideabubbles.universe"
        user = db.query(User).filter(User.email == demo_email).first()
        if not user:
            user = User(
                email=demo_email,
                hashed_password=get_password_hash("midnightuniverse"),
                display_name="Cosmic Explorer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Seed categories
        seed_default_categories(db, user.id)
        categories = db.query(Category).filter(
            (Category.user_id == user.id) | (Category.is_default == True)
        ).all()
        cat_map = {c.name: c for c in categories}

        # Check if ideas exist
        if db.query(Idea).filter(Idea.user_id == user.id).count() > 0:
            print("Database already contains ideas. Skipping seed.")
            return

        now = datetime.now(timezone.utc)

        # Sample Idea 1: AI Terrarium
        idea1 = Idea(
            user_id=user.id,
            category_id=cat_map.get("AI & Technology", categories[0]).id,
            title="Living AI Terrarium",
            raw_thought="A virtual digital terrarium where generative cellular automata organisms grow and mutate based on daily code commits and creative writing velocity.",
            ai_summary="An interactive living simulation linking creative output with procedural botanical growth.",
            status="DEVELOPING",
            importance=5,
            canvas_x=-140.0,
            canvas_y=-60.0,
            canvas_fixed=True,
            created_at=now - timedelta(days=4),
            last_interacted_at=now - timedelta(days=1)
        )
        db.add(idea1)
        db.flush()

        db.add(IdeaNote(idea_id=idea1.id, content="Researched L-systems and WebGL shaders for organic branch rendering."))
        db.add(IdeaNote(idea_id=idea1.id, content="Tested Web Audio synthesizer to trigger delicate chimes whenever a new sprout blooms."))
        db.add(IdeaTask(idea_id=idea1.id, title="Implement L-system procedural tree algorithm", is_completed=True, position=0))
        db.add(IdeaTask(idea_id=idea1.id, title="Connect GitHub webhook or local git watcher", is_completed=False, position=1))
        db.add(IdeaTask(idea_id=idea1.id, title="Design bioluminescent night mode palette", is_completed=False, position=2))
        db.add(Reference(
            idea_id=idea1.id,
            url="https://en.wikipedia.org/wiki/L-system",
            title="Lindenmayer system - Wikipedia",
            description="An algorithmic framework for modeling the growth processes of plant development.",
            domain="en.wikipedia.org"
        ))

        # Sample Idea 2: Generative Ambient Soundscape
        idea2 = Idea(
            user_id=user.id,
            category_id=cat_map.get("Art & Design", categories[0]).id,
            title="Ethereal Solar Synthesizer",
            raw_thought="An ambient sound generator that translates real-time weather and planetary orbital telemetry into evolving, soothing drone harmonies.",
            ai_summary="Procedural audio generator modulated by atmospheric pressure, cloud cover, and solar winds.",
            status="EXPLORING",
            importance=4,
            canvas_x=120.0,
            canvas_y=-110.0,
            canvas_fixed=True,
            created_at=now - timedelta(days=6),
            last_interacted_at=now - timedelta(days=3)
        )
        db.add(idea2)
        db.flush()

        db.add(IdeaNote(idea_id=idea2.id, content="Pentatonic scales sound remarkably calming even when notes are randomized."))
        db.add(IdeaTask(idea_id=idea2.id, title="Prototype 3 Web Audio oscillator nodes with stereo panning", is_completed=True, position=0))
        db.add(IdeaTask(idea_id=idea2.id, title="Fetch free Open-Meteo API data", is_completed=False, position=1))

        # Sample Idea 3: Zero-Friction Thought Pod
        idea3 = Idea(
            user_id=user.id,
            category_id=cat_map.get("Websites & Software", categories[0]).id,
            title="Whisper Voice Journal",
            raw_thought="A single tap audio pod that turns rambling late-night voice memos into structured, elegant atomic thoughts without requiring an internet connection.",
            ai_summary="Offline-first voice capture that automatically segments stream-of-consciousness monologues into actionable ideas.",
            status="ACTIVE_PROJECT",
            importance=5,
            canvas_x=-40.0,
            canvas_y=160.0,
            canvas_fixed=True,
            created_at=now - timedelta(days=8),
            last_interacted_at=now
        )
        db.add(idea3)
        db.flush()

        db.add(IdeaNote(idea_id=idea3.id, content="Web Speech API works with zero latency directly inside Chromium and Safari browsers!"))
        db.add(IdeaTask(idea_id=idea3.id, title="Add one-tap microphone toggle", is_completed=True, position=0))
        db.add(IdeaTask(idea_id=idea3.id, title="Implement auto-punctuation heuristic", is_completed=True, position=1))

        # Sample Idea 4: Dormant Idea for Rediscovery Demonstration
        idea4 = Idea(
            user_id=user.id,
            category_id=cat_map.get("Writing & Literature", categories[0]).id,
            title="Chronicles of the Silicon Nebula",
            raw_thought="A speculative fiction anthology exploring the first generation of starships guided by sentient celestial AI constellations.",
            ai_summary="Sci-fi literary concept focusing on autonomous space exploration and synthetic culture.",
            status="SPARK",
            importance=4,
            canvas_x=220.0,
            canvas_y=80.0,
            canvas_fixed=True,
            created_at=now - timedelta(days=18),
            last_interacted_at=now - timedelta(days=14)
        )
        db.add(idea4)
        db.flush()

        # Connect Idea 1 and Idea 2
        conn1 = IdeaConnection(
            user_id=user.id,
            source_idea_id=idea1.id,
            target_idea_id=idea2.id,
            relationship_type="synergy with",
            description="Terrarium growth triggers generative ambient chord progressions."
        )
        db.add(conn1)

        db.commit()
        print("Successfully seeded initial cosmic universe with 4 ideas and 1 connection!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
