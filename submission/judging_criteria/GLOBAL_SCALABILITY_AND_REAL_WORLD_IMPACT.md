# Global scalability and real-world impact

**Component:** 4 of 5, 20 points  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

The current system is a local application. Scale to millions of people, exports, jobs, and measured health impact are not achievements of this build. They are conditions that would have to be earned later.

## What is Bangladesh-first in the code

- The DiaBD pathway is the Bangladesh screening score, and it is labeled uncalibrated.
- The WHO South Asia non-laboratory chart is implemented as a lookup with an age limit and a prior-event stop.
- The interface has a Bangla catalog and an English catalog. A key comparison on 19 November 2026 found 266 keys on each side and no missing key.
- Some older screens still contain inline English, so language coverage is not perfect on every sentence.

Pima and Cleveland are deliberately not presented as Bangladesh community screens.

## Localization strategy

Keep pathway names, limits, and consent text in both languages. Add a language only when a person reviews the clinical wording. Machine-filling a third language would not be a safe expansion.

## What scale would require

| Today | Required before a larger deployment |
| --- | --- |
| One SQLite file | A managed database, backups, and access control beyond a laptop |
| One local API process | Monitoring, rate limits, and a deployment approval |
| No encryption | A reviewed key design |
| No measured load | A capacity test that has not been run |
| Dataset licenses NOT VERIFIED | Written redistribution permission |

None of that work is scheduled as an approved project.

## Regional and international roadmap

A later South Asian education deployment would still need local clinical review, a license for every external text, and a decision about whether DiaBD or the WHO chart is even appropriate outside its documented scope. International use of the Pima or Cleveland pathways would repeat the same limit those pathways already state: they are not general-population screens.

## Societal impact that can be said

The demo can teach a person the difference between screening and diagnosis, and it can show a doctor-access rule. That is an educational effect in a room. It is not a measured change in disease, employment, or exports.

## NRB and global collaboration

No NRB participation, international mentor, or research contract is recorded. See `NRB_GLOBAL_COLLABORATION.md`.
