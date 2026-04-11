import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import List, Optional, Dict
import os
import json

# Use absolute path to ensure consistency across working directories
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_FILE = os.path.join(BACKEND_DIR, "anisense.db")


def init_database():
    """Initialize SQLite database with all tables"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()

    # Watchlist table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anime_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            added_date TIMESTAMP NOT NULL
        )
    """
    )

    # Users table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            last_active TIMESTAMP
        )
    """
    )

    # User preferences table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            preference_key TEXT NOT NULL,
            preference_value TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, preference_key)
        )
    """
    )

    # User favorite genres
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            genre TEXT NOT NULL,
            priority INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, genre)
        )
    """
    )

    # User favorite themes/moods
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_themes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            theme TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE(user_id, theme)
        )
    """
    )

    # Sample anime selections (onboarding)
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_sample_anime (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            anime_title TEXT NOT NULL,
            anime_id TEXT,
            selected_during_onboarding BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """
    )

    # User interactions tracking
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            anime_id TEXT NOT NULL,
            interaction_type TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """
    )

    # Create indexes for performance
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_genres_user ON user_genres(user_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_interactions_anime ON user_interactions(anime_id)"
    )

    conn.commit()
    conn.close()


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


class WatchlistDB:
    """Database operations for watchlist management"""

    @staticmethod
    def add_anime(anime_id: str, title: str) -> bool:
        """Add anime to watchlist"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO watchlist (anime_id, title, added_date)
                    VALUES (?, ?, ?)
                """,
                    (anime_id, title, datetime.now().isoformat()),
                )
            return True
        except sqlite3.IntegrityError:
            return False
        except Exception as e:
            print(f"Error adding anime to watchlist: {e}")
            return False

    @staticmethod
    def get_all() -> List[dict]:
        """Get all watchlist items"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id, anime_id, title, added_date FROM watchlist")
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error fetching watchlist: {e}")
            return []

    @staticmethod
    def remove_anime(anime_id: str) -> bool:
        """Remove anime from watchlist"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM watchlist WHERE anime_id = ?", (anime_id,))
            return True
        except Exception as e:
            print(f"Error removing anime from watchlist: {e}")
            return False

    @staticmethod
    def check_exists(anime_id: str) -> bool:
        """Check if anime is in watchlist"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 FROM watchlist WHERE anime_id = ?", (anime_id,))
                return cursor.fetchone() is not None
        except Exception as e:
            print(f"Error checking watchlist: {e}")
            return False


class UserDB:
    """Database operations for user management"""

    @staticmethod
    def create_user(user_id: str, username: str) -> Dict:
        """Create new user profile"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO users (user_id, username, created_at, last_active)
                    VALUES (?, ?, ?, ?)
                """,
                    (user_id, username, datetime.now().isoformat(), datetime.now().isoformat()),
                )
            return {"success": True, "user_id": user_id}
        except sqlite3.IntegrityError:
            return {"success": False, "error": "User already exists"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def get_user(user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
                row = cursor.fetchone()
                return dict(row) if row else None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None

    @staticmethod
    def mark_onboarding_complete(user_id: str) -> bool:
        """Mark user onboarding as complete"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET onboarding_completed = TRUE WHERE user_id = ?",
                    (user_id,),
                )
            return True
        except Exception as e:
            print(f"Error marking onboarding complete: {e}")
            return False

    @staticmethod
    def update_last_active(user_id: str) -> bool:
        """Update user last active timestamp"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET last_active = ? WHERE user_id = ?",
                    (datetime.now().isoformat(), user_id),
                )
            return True
        except Exception as e:
            print(f"Error updating last active: {e}")
            return False


class UserPreferencesDB:
    """Database operations for user preferences"""

    @staticmethod
    def save_preferences(user_id: str, preferences: Dict) -> bool:
        """Save generic preferences as key-value pairs"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                for key, value in preferences.items():
                    cursor.execute(
                        """
                        INSERT INTO user_preferences (user_id, preference_key, preference_value)
                        VALUES (?, ?, ?)
                        ON CONFLICT(user_id, preference_key) DO UPDATE SET
                        preference_value = excluded.preference_value,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                        (user_id, key, json.dumps(value) if not isinstance(value, str) else value),
                    )
            return True
        except Exception as e:
            print(f"Error saving preferences: {e}")
            return False

    @staticmethod
    def get_preferences(user_id: str) -> Dict:
        """Get all user preferences"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT preference_key, preference_value FROM user_preferences WHERE user_id = ?",
                    (user_id,),
                )
                rows = cursor.fetchall()
                result = {}
                for row in rows:
                    try:
                        result[row[0]] = json.loads(row[1])
                    except json.JSONDecodeError:
                        result[row[0]] = row[1]
                return result
        except Exception as e:
            print(f"Error fetching preferences: {e}")
            return {}

    @staticmethod
    def update_preference(user_id: str, key: str, value: str) -> bool:
        """Update single preference"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO user_preferences (user_id, preference_key, preference_value)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_id, preference_key) DO UPDATE SET
                    preference_value = excluded.preference_value,
                    updated_at = CURRENT_TIMESTAMP
                """,
                    (user_id, key, value),
                )
            return True
        except Exception as e:
            print(f"Error updating preference: {e}")
            return False

    @staticmethod
    def save_genres(user_id: str, genres: List[str]) -> bool:
        """Save user's favorite genres"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                # Clear existing genres
                cursor.execute("DELETE FROM user_genres WHERE user_id = ?", (user_id,))
                # Insert new genres with priorities
                for idx, genre in enumerate(genres):
                    cursor.execute(
                        "INSERT INTO user_genres (user_id, genre, priority) VALUES (?, ?, ?)",
                        (user_id, genre, idx + 1),
                    )
            return True
        except Exception as e:
            print(f"Error saving genres: {e}")
            return False

    @staticmethod
    def get_genres(user_id: str) -> List[str]:
        """Get user's favorite genres"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT genre FROM user_genres WHERE user_id = ? ORDER BY priority",
                    (user_id,),
                )
                rows = cursor.fetchall()
                return [row[0] for row in rows]
        except Exception as e:
            print(f"Error fetching genres: {e}")
            return []

    @staticmethod
    def save_themes(user_id: str, themes: List[str]) -> bool:
        """Save user's favorite themes"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                # Clear existing themes
                cursor.execute("DELETE FROM user_themes WHERE user_id = ?", (user_id,))
                # Insert new themes
                for theme in themes:
                    cursor.execute(
                        "INSERT INTO user_themes (user_id, theme) VALUES (?, ?)",
                        (user_id, theme),
                    )
            return True
        except Exception as e:
            print(f"Error saving themes: {e}")
            return False

    @staticmethod
    def get_themes(user_id: str) -> List[str]:
        """Get user's favorite themes"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT theme FROM user_themes WHERE user_id = ?",
                    (user_id,),
                )
                rows = cursor.fetchall()
                return [row[0] for row in rows]
        except Exception as e:
            print(f"Error fetching themes: {e}")
            return []

    @staticmethod
    def save_sample_anime(user_id: str, anime_list: List[Dict]) -> bool:
        """Save sample anime selections from onboarding"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                # Clear existing sample anime
                cursor.execute("DELETE FROM user_sample_anime WHERE user_id = ?", (user_id,))
                # Insert new sample anime
                for anime in anime_list:
                    title = anime.get("title", anime) if isinstance(anime, dict) else anime
                    anime_id = anime.get("id") if isinstance(anime, dict) else None
                    cursor.execute(
                        "INSERT INTO user_sample_anime (user_id, anime_title, anime_id) VALUES (?, ?, ?)",
                        (user_id, title, anime_id),
                    )
            return True
        except Exception as e:
            print(f"Error saving sample anime: {e}")
            return False

    @staticmethod
    def get_sample_anime(user_id: str) -> List[Dict]:
        """Get user's sample anime selections"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT anime_title, anime_id FROM user_sample_anime WHERE user_id = ?",
                    (user_id,),
                )
                rows = cursor.fetchall()
                return [{"title": row[0], "id": row[1]} for row in rows]
        except Exception as e:
            print(f"Error fetching sample anime: {e}")
            return []


class UserInteractionsDB:
    """Database operations for user interactions"""

    @staticmethod
    def record_interaction(user_id: str, anime_id: str, interaction_type: str) -> bool:
        """Record user interaction with anime"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO user_interactions (user_id, anime_id, interaction_type)
                    VALUES (?, ?, ?)
                """,
                    (user_id, anime_id, interaction_type),
                )
            return True
        except Exception as e:
            print(f"Error recording interaction: {e}")
            return False

    @staticmethod
    def get_user_interactions(user_id: str, limit: int = 50) -> List[Dict]:
        """Get user interaction history"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT anime_id, interaction_type, timestamp
                    FROM user_interactions
                    WHERE user_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                """,
                    (user_id, limit),
                )
                rows = cursor.fetchall()
                return [{"anime_id": row[0], "interaction_type": row[1], "timestamp": row[2]} for row in rows]
        except Exception as e:
            print(f"Error fetching interactions: {e}")
            return []

    @staticmethod
    def get_liked_anime(user_id: str) -> List[str]:
        """Get list of anime user has liked"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT anime_id FROM user_interactions WHERE user_id = ? AND interaction_type = 'like'",
                    (user_id,),
                )
                rows = cursor.fetchall()
                return [row[0] for row in rows]
        except Exception as e:
            print(f"Error fetching liked anime: {e}")
            return []

    @staticmethod
    def get_disliked_anime(user_id: str) -> List[str]:
        """Get list of anime user has disliked"""
        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT anime_id FROM user_interactions WHERE user_id = ? AND interaction_type = 'dislike'",
                    (user_id,),
                )
                rows = cursor.fetchall()
                return [row[0] for row in rows]
        except Exception as e:
            print(f"Error fetching disliked anime: {e}")
            return []


# Initialize database on import
if not os.path.exists(DATABASE_FILE):
    init_database()
else:
    # Ensure tables exist on every run (safe migration)
    init_database()
