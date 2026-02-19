import re
import random

# AI detection footprint words to purge aggressively across all personas
AI_FOOTPRINTS = {
    "delve": ["explore", "look into"],
    "tapestry": ["mix", "combination"],
    "testament": ["proof", "example"],
    "beacon": ["guide", "example"],
    "intricate": ["complex", "detailed"],
    "overarching": ["main", "overall"],
    "subsequently": ["then", "after that"],
    "nevertheless": ["anyway", "but still"],
    "furthermore": ["also", "and"],
    "consequently": ["so", "because of that"],
    "therefore": ["so", "that's why"],
    "moreover": ["plus", "also"]
}

class HumanizerEngine:
    def __init__(self, persona_config: dict):
        self.replacements = persona_config.get("replacements", {})
        self.fillers = persona_config.get("fillers", [])
        
        # Merge AI footprint replacements into persona replacements (persona overrides footprints if both exist)
        for word, alts in AI_FOOTPRINTS.items():
            if word not in self.replacements:
                self.replacements[word] = alts

    def process(self, text: str) -> str:
        # Step 1: Vocabulary Refactor & Detection Counter-Measures
        text = self._refactor_vocabulary(text)
        
        # Step 2: Burstiness Engine (Vary sentence lengths)
        text = self._apply_burstiness(text)
        
        # Step 3: Strategic Imperfection
        text = self._inject_imperfections(text)
        
        return text

    def _match_case(self, original: str, replacement: str) -> str:
        """Preserves the casing of the original word."""
        if original.isupper():
            return replacement.upper()
        elif original.istitle():
            return replacement.title()
        return replacement.lower()

    def _refactor_vocabulary(self, text: str) -> str:
        """Replaces formal AI target words with natural synonyms using weighted randomness."""
        
        for word, alternatives in self.replacements.items():
            # \b matches word boundaries, (?i) makes it case-insensitive
            pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
            
            def replace_match(match):
                original_word = match.group(0)
                chosen_alt = random.choice(alternatives)
                return self._match_case(original_word, chosen_alt)
                
            text = pattern.sub(replace_match, text)
            
        return text

    def _apply_burstiness(self, text: str) -> str:
        """Alters sentence lengths for burstiness."""
        # Simple implementation for V1: Occasionally split long sentences on 'and' or 'but'
        
        # Split into sentences roughly
        sentences = re.split(r'(?<=[.!?])\s+', text)
        processed_sentences = []
        
        for sentence in sentences:
            if not sentence:
                continue
                
            # If sentence is long (e.g. > 15 words) and contains ", and " or ", but ", 
            # maybe split it up
            words = sentence.split()
            if len(words) > 15 and random.random() < 0.3:
                # Try to split on ", and "
                parts = re.split(r',\s+and\s+', sentence, flags=re.IGNORECASE, maxsplit=1)
                if len(parts) == 2:
                    processed_sentences.append(parts[0] + ".")
                    processed_sentences.append("And " + parts[1])
                    continue
                    
                # Try to split on ", but "
                parts = re.split(r',\s+but\s+', sentence, flags=re.IGNORECASE, maxsplit=1)
                if len(parts) == 2:
                    processed_sentences.append(parts[0] + ".")
                    processed_sentences.append("But " + parts[1])
                    continue

            processed_sentences.append(sentence)
            
        return " ".join(processed_sentences)

    def _inject_imperfections(self, text: str) -> str:
        """Injects thought-process filler phrases and transition starters."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        processed_sentences = []
        
        for sentence in sentences:
            if not sentence:
                continue
                
            # Randomly inject a filler phrase at the start of a sentence
            if self.fillers and random.random() < 0.15: # 15% chance
                filler = random.choice(self.fillers)
                # Capitalize the filler to start the sentence
                if len(sentence) > 0 and sentence[0].isupper() and (len(sentence) == 1 or sentence[1:].islower()):
                    sentence = f"{filler.title()}, {sentence[0].lower()}{sentence[1:]}"
                else:
                    sentence = f"{filler.title()}, {sentence}"
            
            processed_sentences.append(sentence)
            
        return " ".join(processed_sentences)
