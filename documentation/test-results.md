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

| Threshold | Artwork photos accepted | Accepted and correct | Non-artwork photos rejected | Other-artwork photos rejected |
|---|---|---|---|---|
| 0.60 | 30/30 | 30/30 | 11/12 | 1/10 |
| 0.65 | 30/30 | 30/30 | 12/12 | 2/10 |
| 0.70 | 30/30 | 30/30 | 12/12 | 3/10 |
| 0.75 | 30/30 | 30/30 | 12/12 | 7/10 |
| 0.80 | 27/30 | 27/30 | 12/12 | 9/10 |
| 0.85 | 24/30 | 24/30 | 12/12 | 9/10 |
| 0.90 | 15/30 | 15/30 | 12/12 | 10/10 |
| 0.95 | 0/30 | 0/30 | 12/12 | 10/10 |

Suggested threshold: 0.70 (overall correct decisions: 100.0% of all test photos).

## Famous artworks that are not in the reference set

- Images: 10; top-1 score: min 0.595, mean 0.723, max 0.891
- Correctly rejected at the deployed threshold 0.70: 3/10

| Image | Closest reference artwork | Score | Outcome |
|---|---|---|---|
| 1703534716-14fdab71c5763084a5ed.jpg | Mäda Primavesi (1903–2000) | 0.595 | rejected |
| 1703534910-5bd2a78f6e83815f1c01.jpg | Study of a Young Woman | 0.891 | wrongly accepted |
| 600x0 - Kopya.jpg | Portrait of a Woman with a Man at a Casement | 0.705 | wrongly accepted |
| CREATION-OF-ADAM - Kopya.jpg | Venus and Adonis | 0.708 | wrongly accepted |
| dunyanin-en-unlu-sanat-eserleri-hakkinda-bilinmeyenler-bellegin-azmi-eriyen-saatler.webp | Hagar in the Wilderness | 0.683 | rejected |
| dunyanin-en-unlu-sanat-eserleri-hakkinda-bilinmeyenler-opucuk.webp | Mäda Primavesi (1903–2000) | 0.786 | wrongly accepted |
| images (1).jpg | The Englishman (William Tom Warrener, 1861–1934) at the Moulin Rouge | 0.648 | rejected |
| images.jpg | Study of a Young Woman | 0.729 | wrongly accepted |
| Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg | View of Toledo | 0.717 | wrongly accepted |
| VASE-WITH-TWO-SUNFLOWERS-–-Vazoda-On-İki-Ayçiçeği.jpg | Still Life with Apples and a Pot of Primroses | 0.769 | wrongly accepted |

## Margin rule (top-1 score minus top-2 score)

- Artwork photos: min 0.011, mean 0.101, max 0.219
- Non-artwork photos: min 0.001, mean 0.013, max 0.035
- Other-artwork images: min 0.001, mean 0.027, max 0.098

Accept only if score >= 0.70 and margin >= the value below.

| Minimum margin | Artwork photos accepted and correct | Non-artwork photos rejected | Other-artwork images rejected |
|---|---|---|---|
| 0.00 | 30/30 | 12/12 | 3/10 |
| 0.01 | 30/30 | 12/12 | 5/10 |
| 0.02 | 28/30 | 12/12 | 5/10 |
| 0.03 | 27/30 | 12/12 | 6/10 |
| 0.04 | 27/30 | 12/12 | 8/10 |
| 0.05 | 27/30 | 12/12 | 9/10 |
| 0.06 | 26/30 | 12/12 | 9/10 |
| 0.07 | 24/30 | 12/12 | 9/10 |
| 0.08 | 20/30 | 12/12 | 9/10 |
| 0.09 | 15/30 | 12/12 | 9/10 |
| 0.10 | 15/30 | 12/12 | 10/10 |

| Other-artwork image | Score | Margin |
|---|---|---|
| 1703534716-14fdab71c5763084a5ed.jpg | 0.595 | 0.001 |
| 1703534910-5bd2a78f6e83815f1c01.jpg | 0.891 | 0.098 |
| 600x0 - Kopya.jpg | 0.705 | 0.010 |
| CREATION-OF-ADAM - Kopya.jpg | 0.708 | 0.001 |
| dunyanin-en-unlu-sanat-eserleri-hakkinda-bilinmeyenler-bellegin-azmi-eriyen-saatler.webp | 0.683 | 0.005 |
| dunyanin-en-unlu-sanat-eserleri-hakkinda-bilinmeyenler-opucuk.webp | 0.786 | 0.036 |
| images (1).jpg | 0.648 | 0.014 |
| images.jpg | 0.729 | 0.049 |
| Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg | 0.717 | 0.027 |
| VASE-WITH-TWO-SUNFLOWERS-–-Vazoda-On-İki-Ayçiçeği.jpg | 0.769 | 0.031 |
