import json
import re
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    @property
    def is_ai_configured(self) -> bool:
        if self.provider == "gemini" and bool(self.gemini_key):
            return True
        if self.provider == "openai" and bool(self.openai_key):
            return True
        return False

    async def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Calls Google Gemini API via REST endpoint with key."""
        if not self.gemini_key:
            return None
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={self.gemini_key}"
        
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will strictly follow these instructions."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
        except Exception:
            pass
        return None

    async def _call_openai(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Calls OpenAI API via REST endpoint with key."""
        if not self.openai_key:
            return None
        url = "https://api.openai.com/v1/chat/completions"
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
        except Exception:
            pass
        return None

    async def _generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if self.provider == "gemini":
            res = await self._call_gemini(prompt, system_instruction)
            if res:
                return res
        if self.provider == "openai" or bool(self.openai_key):
            res = await self._call_openai(prompt, system_instruction)
            if res:
                return res
        return None

    # ------------------ Core AI Operations ------------------

    async def quick_enrich(self, raw_thought: str) -> Dict[str, Any]:
        """
        Generates concise title, 1-sentence summary, suggested category, and tags.
        Gracefully falls back to heuristic extraction if AI is unavailable.
        """
        if self.is_ai_configured:
            prompt = f"""Analyze this raw thought and return a JSON object with:
- "title": A compelling 3-6 word title
- "summary": A 1-sentence crystal clear essence
- "category": Choose one of: "Startups & Business", "Websites & Software", "AI & Technology", "Research & Learning", "Writing & Literature", "Art & Design", "Personal Projects", "Random Thoughts"
- "tags": Array of 2-4 lowercase relevant keyword tags

Raw thought:
"{raw_thought}"

Respond ONLY with valid JSON, no markdown formatting."""

            response = await self._generate_text(prompt, "You are a concise conceptual architect.")
            if response:
                try:
                    cleaned = re.sub(r"^```(?:json)?|```$", "", response.strip(), flags=re.MULTILINE).strip()
                    data = json.loads(cleaned)
                    return {
                        "title": data.get("title", self._heuristic_title(raw_thought)),
                        "summary": data.get("summary", raw_thought[:120]),
                        "category": data.get("category", "Random Thoughts"),
                        "tags": data.get("tags", self._heuristic_tags(raw_thought))
                    }
                except Exception:
                    pass

        # Heuristic fallback
        return {
            "title": self._heuristic_title(raw_thought),
            "summary": raw_thought[:140] + ("..." if len(raw_thought) > 140 else ""),
            "category": self._heuristic_category(raw_thought),
            "tags": self._heuristic_tags(raw_thought)
        }

    async def summarize(self, idea_context: Dict[str, Any]) -> Dict[str, Any]:
        """Deep summary, key themes, and unresolved questions."""
        title = idea_context.get("title", "")
        raw = idea_context.get("raw_thought", "")
        notes = " ".join([n.get("content", "") for n in idea_context.get("notes", [])])

        if self.is_ai_configured:
            prompt = f"""Given this idea:
Title: {title}
Original Thought: {raw}
Notes: {notes}

Return a valid JSON object with:
- "title": polished title
- "one_sentence_summary": concise essence
- "detailed_explanation": 2-3 sentence elaboration
- "key_themes": array of 3 key thematic pillars
- "unresolved_questions": array of 2-3 important questions or hidden assumptions
- "suggested_categories": array of 1-2 suggested categories

Return ONLY raw JSON."""
            response = await self._generate_text(prompt)
            if response:
                try:
                    cleaned = re.sub(r"^```(?:json)?|```$", "", response.strip(), flags=re.MULTILINE).strip()
                    return json.loads(cleaned)
                except Exception:
                    pass

        # Heuristic fallback
        return {
            "title": title or self._heuristic_title(raw),
            "one_sentence_summary": (raw[:150] + "...") if len(raw) > 150 else raw,
            "detailed_explanation": f"This idea revolves around '{title}'. It was initiated from the spark: '{raw}'. It represents an opportunity to explore creative or technical frontiers.",
            "key_themes": ["Concept Exploration", "Execution Feasibility", "User Value"],
            "unresolved_questions": [
                "What is the simplest MVP or prototype to test this week?",
                "Who is the ideal initial audience or collaborator?",
                "What is the single biggest technical or creative risk?"
            ],
            "suggested_categories": [self._heuristic_category(raw)]
        }

    async def expand(self, idea_context: Dict[str, Any]) -> Dict[str, Any]:
        """Expands idea into directions, assumptions, first experiments, and next steps."""
        title = idea_context.get("title", "")
        raw = idea_context.get("raw_thought", "")
        notes = " ".join([n.get("content", "") for n in idea_context.get("notes", [])])

        if self.is_ai_configured:
            prompt = f"""Provide actionable strategic expansion for:
Title: {title}
Original Concept: {raw}
Notes: {notes}

Return a valid JSON object with:
- "possible_directions": array of 3 distinct angles or creative branches
- "assumptions": array of 2 critical assumptions that need validation
- "first_experiments": array of 2 quick, low-cost experiments
- "potential_challenges": array of 2 realistic friction points
- "realistic_next_step": 1 immediate concrete action for the next 48 hours

Return ONLY raw JSON."""
            res = await self._generate_text(prompt)
            if res:
                try:
                    cleaned = re.sub(r"^```(?:json)?|```$", "", res.strip(), flags=re.MULTILINE).strip()
                    return json.loads(cleaned)
                except Exception:
                    pass

        # Heuristic fallback
        return {
            "possible_directions": [
                f"Develop '{title}' as a minimal open-source tool or prototype",
                f"Explore a narrative or design-first visual case study",
                f"Partner with domain experts or users to gather direct feedback"
            ],
            "assumptions": [
                "Users experience sufficient friction to warrant a dedicated solution",
                "The core interaction can be simplified into a single intuitive screen"
            ],
            "first_experiments": [
                "Create a one-page interactive mockup or concept brief and share it with 3 peers",
                "Draft the core algorithm or user flow in a notebook or sandbox"
            ],
            "potential_challenges": [
                "Balancing conceptual depth with lightweight user interaction",
                "Maintaining momentum after the initial spark"
            ],
            "realistic_next_step": "Draft a 1-page milestone checklist and define the core deliverable."
        }

    async def chat(self, idea_context: Dict[str, Any], message_history: List[Dict[str, str]], user_message: str) -> str:
        """Brainstorming chat with the grounded idea context."""
        title = idea_context.get("title", "Untitled")
        raw = idea_context.get("raw_thought", "")
        notes = "\n".join([f"- {n.get('content', '')}" for n in idea_context.get("notes", [])])
        refs = "\n".join([f"- {r.get('title', '')} ({r.get('url', '')})" for r in idea_context.get("references", [])])

        system_instruction = f"""You are a creative brainstorming partner, conceptual architect, and sounding board for the user's idea in Idea Bubbles.
The idea you are discussing is:
Title: {title}
Initial Thought: {raw}

Saved Notes:
{notes or "None yet"}

Saved References:
{refs or "None yet"}

Be supportive, sharp, constructive, and inspiring. Offer provocative questions, concrete design ideas, or technical directions. Do not give generic corporate advice."""

        if self.is_ai_configured:
            # Build conversation prompt
            history_text = "\n".join([f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in message_history[-6:]])
            prompt = f"{history_text}\nUSER: {user_message}\nASSISTANT:"
            reply = await self._generate_text(prompt, system_instruction)
            if reply:
                return reply.strip()

        # Offline heuristic conversational partner
        user_lower = user_message.lower()
        if "how" in user_lower or "start" in user_lower or "begin" in user_lower:
            return f"To get '{title}' moving without overthinking, start with the smallest possible slice: capture the core interaction in a 5-minute wireframe or markdown spec. What is the single most exciting feature to you right now?"
        elif "risk" in user_lower or "problem" in user_lower or "challenge" in user_lower:
            return f"The main challenge with '{title}' is usually scope creep. When ideas feel expansive, we try to solve everything at once. If you had to build a version that did only ONE thing extraordinarily well, what would that be?"
        elif "name" in user_lower or "title" in user_lower:
            return f"For '{title}', you could lean into evocative, cosmic, or functional naming. Consider ideas like: SparkFlow, Nexus-{title[:4]}, or a poetic compound name that captures: '{raw[:30]}'."
        else:
            return f"That's a compelling angle for '{title}'. Building on '{raw[:60]}...', have you considered how this connects with your other projects? You can also add specific milestones in the Tasks tab or link reference research!"

    # ------------------ Heuristic Helpers ------------------

    def _heuristic_title(self, text: str) -> str:
        words = text.strip().split()
        if not words:
            return "New Spark"
        if len(words) <= 5:
            return " ".join(words).capitalize()
        # Take first 4-5 words
        first_phrase = " ".join(words[:5])
        first_phrase = re.sub(r"[,;:.!?]+$", "", first_phrase)
        return first_phrase.capitalize()

    def _heuristic_category(self, text: str) -> str:
        text_lower = text.lower()
        if any(w in text_lower for w in ["startup", "business", "market", "revenue", "saas", "client", "sales"]):
            return "Startups & Business"
        if any(w in text_lower for w in ["app", "website", "software", "api", "code", "dev", "react", "python"]):
            return "Websites & Software"
        if any(w in text_lower for w in ["ai", "llm", "agent", "model", "gpt", "gemini", "neural", "vision"]):
            return "AI & Technology"
        if any(w in text_lower for w in ["paper", "study", "research", "learn", "physics", "science", "read"]):
            return "Research & Learning"
        if any(w in text_lower for w in ["write", "story", "book", "poem", "essay", "article", "novel"]):
            return "Writing & Literature"
        if any(w in text_lower for w in ["art", "design", "ui", "ux", "paint", "draw", "music", "visual", "color"]):
            return "Art & Design"
        if any(w in text_lower for w in ["habit", "routine", "personal", "home", "fitness", "garden", "diy"]):
            return "Personal Projects"
        return "Random Thoughts"

    def _heuristic_tags(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z]{4,15}\b", text.lower())
        stopwords = {
            "this", "that", "with", "from", "have", "make", "what", "when", "where",
            "there", "about", "would", "could", "should", "their", "which", "some"
        }
        filtered = [w for w in words if w not in stopwords]
        # Return unique top 3
        seen = set()
        tags = []
        for w in filtered:
            if w not in seen:
                seen.add(w)
                tags.append(w)
            if len(tags) >= 3:
                break
        return tags or ["idea", "spark"]

ai_service = AIService()
