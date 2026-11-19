"""Read-only intelligence views. They do not score patients or change model files."""

import json
from pathlib import Path

from fastapi import HTTPException

from app.services.knowledge import CHUNKS, GRAPH, KNOWLEDGE_VERSION
from app.services.lineage import pathway_lineage

ROOT = Path(__file__).resolve().parents[3]
DIABD_METRICS = ROOT / "ML_Model" / "evaluation" / "bd_diabetes_metrics.json"

SHAP_POLICY = {
    "diabd": "Existing local TreeSHAP on the DiaBD model. A feature contribution is not a cause.",
    "cleveland": "Global model coefficients only. They are not an individual SHAP explanation.",
    "who_chart": "Deterministic published-chart lookup. There is no trained model and no SHAP vector.",
    "pima": "Existing model output. Kept for the eight historical measurements. The cohort is women aged 21 to 81, not a Bangladesh patient model, and the score is not a diagnosis.",
}


def explain_center() -> dict:
    lineage = pathway_lineage(None)
    return {
        "educational_label": "Educational knowledge assistant. Not a diagnostic or treatment service.",
        "separate_from_prediction_engine": True,
        "shap_policy": SHAP_POLICY,
        "pathways": lineage["pathways"],
        "limitations": lineage["limitations"],
        "governance": lineage["governance"],
        "new_thresholds": False,
    }


def fairness_report() -> dict:
    recorded = json.loads(DIABD_METRICS.read_text(encoding="utf-8"))
    matrix = recorded.get("confusion_matrix")
    return {
        "synthetic_evaluation_run": False,
        "real_world_fairness_claimed": False,
        "historical_repository_evidence": {
            "evidence_class": "historical_file_already_in_repository",
            "source": "ML_Model/evaluation/bd_diabetes_metrics.json",
            "dataset": recorded.get("dataset"),
            "test_rows": recorded.get("test_rows"),
            "test_metrics": recorded.get("test_metrics"),
            "confusion_matrix": matrix,
            "note": recorded.get("note"),
            "license_status_in_data_card": "NOT VERIFIED",
        },
        "suppressed": [
            {
                "metric": "subgroup_sensitivity",
                "reason": "No approved subgroup ground-truth table is available.",
            },
            {
                "metric": "subgroup_specificity",
                "reason": "No approved subgroup ground-truth table is available.",
            },
            {
                "metric": "fairness_gap",
                "reason": "A gap would require labeled subgroups that this module does not have.",
            },
            {
                "metric": "calibration_by_group",
                "reason": "DiaBD remains an uncalibrated screening score. Group calibration is not calculated here.",
            },
        ],
        "pathways_not_recomputed": ["cleveland", "pima", "who_chart"],
    }


def graph_node(node_id: str) -> dict:
    node = next((item for item in GRAPH["nodes"] if item["id"] == node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail="Concept not found")
    edges = [
        edge for edge in GRAPH["edges"]
        if edge["from"] == node_id or edge["to"] == node_id
    ]
    return {
        "node": node,
        "edges": edges,
        "causal_claims": False,
        "knowledge_version": KNOWLEDGE_VERSION,
    }


def governance_snapshot() -> dict:
    return {
        "admin_approval_is_not_regulatory_approval": True,
        "governance": "NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED",
        "model_registry": explain_center()["pathways"],
        "dataset_registry": [
            {
                "name": "DiaBD",
                "source": "docs/governance/DATA_CARDS.md",
                "license": "NOT VERIFIED",
                "intended_use": "Uncalibrated screening score",
                "redistribution": "NOT VERIFIED",
            },
            {
                "name": "Pima",
                "source": "docs/governance/DATA_CARDS.md",
                "license": "NOT VERIFIED",
                "intended_use": "Admin or research only",
                "redistribution": "NOT VERIFIED",
            },
            {
                "name": "Cleveland",
                "source": "docs/governance/DATA_CARDS.md",
                "license": "NOT VERIFIED",
                "intended_use": "Historical catheterization cohort",
                "redistribution": "NOT VERIFIED",
            },
            {
                "name": "WHO South Asia chart",
                "source": "docs/governance/DATA_CARDS.md",
                "license": "NOT VERIFIED",
                "intended_use": "Deterministic lookup, ages 40-74",
                "redistribution": "NOT VERIFIED",
            },
        ],
        "rag_documents": [
            {
                "id": chunk["id"],
                "source": chunk["source"],
                "license": chunk["license"],
                "version": KNOWLEDGE_VERSION,
                "ingestion": "in_process_project_text",
                "retrieval": "lexical_token_overlap",
                "review_status": "project_note_not_external_publication",
            }
            for chunk in CHUNKS
        ],
        "graph": {
            "nodes": len(GRAPH["nodes"]),
            "edges": len(GRAPH["edges"]),
            "causal_claims": False,
            "every_edge_has_source": all(edge.get("source") for edge in GRAPH["edges"]),
        },
        "semantic_embeddings": "NOT INSTALLED",
    }
