# Test results

## Recognition accuracy (artwork photos)

- Photos: 30
- Top-1 accuracy: 30/30 = 100.0%
- Top-3 accuracy: 30/30 = 100.0%
- Top-1 score when correct: min 0.775, mean 0.882, max 0.942

## Wrong top-1 predictions

None.

## Non-artwork photos

- Photos: 12; top-1 score: min 0.343, mean 0.481, max 0.624

## Unknown threshold

| Threshold | Artwork photos accepted | Accepted and correct | Non-artwork photos rejected |
|---|---|---|---|
| 0.60 | 30/30 | 30/30 | 11/12 |
| 0.65 | 30/30 | 30/30 | 12/12 |
| 0.70 | 30/30 | 30/30 | 12/12 |
| 0.75 | 30/30 | 30/30 | 12/12 |
| 0.80 | 27/30 | 27/30 | 12/12 |
| 0.85 | 24/30 | 24/30 | 12/12 |
| 0.90 | 15/30 | 15/30 | 12/12 |
| 0.95 | 0/30 | 0/30 | 12/12 |

Suggested threshold: 0.70 (overall correct decisions: 100.0% of all test photos).
