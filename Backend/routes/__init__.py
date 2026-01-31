"""
Route Initialization
Makes routes importable as a package
"""
from . import auth, profile, chat, universities, tasks

__all__ = ["auth", "profile", "chat", "universities", "tasks"]
