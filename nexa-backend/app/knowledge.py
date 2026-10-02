"""Knowledge base: chunks exported by tools/export-knowledge.mjs."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Chunk:
    id: str
    title: str
    section: str
    url: str
    text: str
    project_id: str | None = None


def load_chunks(path: Path) -> list[Chunk]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if data.get("version") != 1:
        raise ValueError(f"Unsupported knowledge file version: {data.get('version')}")
    return [
        Chunk(id=c["id"], title=c["title"], section=c["section"], url=c["url"], text=c["text"], project_id=c.get("projectId"))
        for c in data["chunks"]
    ]
