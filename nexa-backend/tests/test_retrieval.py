"""Retrieval quality on the real exported knowledge base."""
from __future__ import annotations

import pytest

from app.config import Settings
from app.knowledge import load_chunks
from app.retrieval import BM25Retriever

R = BM25Retriever(load_chunks(Settings().knowledge_path))


def top_projects(q, k=6, **kw):
    return [c.project_id for c, s in R.search(q, k=k, **kw) if s > 0]


@pytest.mark.parametrize("question,expected", [
    ("Explain SecureVault AI", "securevault-ai"),
    ("Why did you use AES-256-GCM?", "securevault-ai"),
    ("How does the blockchain key vault work?", "securevault-ai"),
    ("What is NEXA?", "nexa"),
    ("computer vision plants", "floramind-ai"),
    ("packet sniffer scapy", "packet-sniffer"),
    ("climate geospatial maps", "earthpulse"),
])
def test_expected_project_ranks_first(question, expected):
    assert top_projects(question)[0] == expected


def test_profile_questions_find_profile():
    ids = [c.id for c, _ in R.search("Where did Nausheen study?", k=3)]
    assert "profile:education" in ids


def test_undocumented_chunk_attached_for_project_questions():
    ids = [c.id for c, _ in R.search("What was the biggest challenge in SecureVault AI?", k=4)]
    assert "securevault-ai:undocumented" in ids


def test_concept_chunks_carry_plan_warning():
    for c, _ in R.search("NEXA architecture", k=5):
        if c.project_id == "nexa":
            assert "PLAN, not a built feature" in c.text


def test_gibberish_finds_nothing():
    assert R.search("zxqv plorbt", k=5) == []
