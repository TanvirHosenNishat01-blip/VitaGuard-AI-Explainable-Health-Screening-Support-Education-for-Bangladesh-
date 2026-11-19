# Reproducibility

Random seed: 42.
Python: 3.14.4.
NumPy: 2.5.4. pandas: 3.1.0.
Previous-result reproduction matched: True.

Run `backend\venv\Scripts\python.exe ML_Research\Accuracy_Improvement\final_26h_experiments\run_final_26h.py` from the repository root.

Protected file hashes were recorded before and after the run. The script writes only inside `ML_Research/Accuracy_Improvement/final_26h_experiments/`.

CatBoost was not installed and was not added during this run.

The locked DiaBD and Cleveland splits are the stratified 80/20 splits at seed 42. Their index hashes are in `dataset_integrity_report.json`.

The previous `results.json` comparison matched within 0.002 on every checked metric. The published DiaBD confusion matrix and the published Cleveland 32/0/5/23 matrix were reproduced from the saved artifacts. Protected hashes, including the nine model artifacts, the chart module, the prediction route, and `backend/vitaguard.db`, were unchanged at the end of the run.
