# Final test results

Each suite was run as its own process. Combined runs are not valid because they replace the database override.

| Suite | Result |
| --- | --- |
| tests.test_phase_a_security | 14 passed |
| tests.test_phase_b_privacy | 6 passed |
| tests.test_phase_c_platform | 7 passed |
| tests.test_phase_d_coordination | 4 passed |
| tests.test_phase_e_intelligence | 7 passed, including a consented Pima 200 and the nine artifact hashes |
| tests.test_phase_f_readiness | 4 passed |
| tests.test_phase_g_ecosystem | 4 passed |
| npm run build | Exit 0. Chunk `dist/assets/index-CfhnMsHA.js`, 640.48 kB. The existing size warning remains |

There is no frontend unit-test script. Navigation and the closed Pima page were checked in the browser as a guest. Signed-in demo clicks were not completed in the browser.

Nine artifact hashes matched `ML_Research/Competition_Readiness/ML_ARTIFACT_BASELINE.json` inside Phase E and Phase G. No model file was written.
