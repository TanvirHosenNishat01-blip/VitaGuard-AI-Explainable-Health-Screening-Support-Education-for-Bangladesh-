# WHO lookup verification

The South Asia non-laboratory chart is a published lookup in `backend/app/services/bd_cvd_chart.py`. This audit did not train a model and did not change a cell.

Check result: table intact = True. Expected 700 cells. Ages 39 and 75 do not resolve. Ages 40 and 74 do. The route source still limits age to 40–74 and rejects a prior heart attack or stroke before lookup.

Matching the table is a consistency check. It is not model accuracy and it has no false-positive count.
