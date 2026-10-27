# Artwork Recognition

A mobile app that recognizes a painting from a photo. The photo is sent to a FastAPI backend, which
computes a CLIP image embedding and compares it with the embeddings of a reference set of 60 European
paintings (cosine similarity). The matched artwork is returned with its information in Turkish and
English. Every scan is stored in the user's history.

This repository is the code of a university thesis project.

## How it works

1. The user takes or picks a photo in the mobile app (Expo / React Native).
2. The app resizes the photo and uploads it to `POST /recognize`.
3. The backend embeds the photo with CLIP ViT-B/32 and finds the most similar reference artworks.
4. If the best cosine similarity is at least the threshold (default `0.70`), the artwork counts as
   recognized. Otherwise the app reports that no artwork was found.
5. Artwork details come from a PostgreSQL database (Neon) and the result is saved in the history.

## Repository layout

| Path | Content |
|---|---|
| `backend/` | FastAPI application (auth, recognition, history, daily artwork) |
| `mobile/` | Expo app (TypeScript) |
| `data/images/` | Reference images (Met Open Access, CC0) |
| `data/metadata/` | Artwork metadata and descriptions |
| `data/embeddings/` | Precomputed CLIP embeddings of the reference images |
| `data/daily_facts.json` | Short facts shown in the app (see "Content verification") |
| `data/test_photos/` | Test photos and labels (private photos are not committed) |
| `scripts/` | Dataset download, embedding, import and evaluation scripts |
| `documentation/` | Dataset notes, test results, verification checklists |

## Requirements

- Python 3.13 (the version used for development and for the test install)
- Node.js (LTS) and the Expo Go app on a phone for the mobile app
- A PostgreSQL database (a free Neon project is enough)

## Backend setup

From the project root:

```
python -m venv .venv
.venv\Scripts\activate          # Windows (use `source .venv/bin/activate` on macOS/Linux)
pip install -r backend/requirements.txt
```

Create a `.env` file in the project root (see `.env.example`):

```
DATABASE_URL=<your PostgreSQL connection string>
SECRET_KEY=<a long random string>
```

Generate a secret key with:

```
python -c "import secrets; print(secrets.token_hex(32))"
```

Optional: `RECOGNITION_THRESHOLD` (default `0.70`).

Never commit `.env`. It is listed in `.gitignore`.

Load the reference artworks into the database (once):

```
python scripts/import_artworks.py
```

Start the server:

```
python -m uvicorn backend.app.main:app --host 0.0.0.0 --reload --reload-dir backend
```

Interactive API documentation is available at `http://localhost:8000/docs`.

## Mobile app setup

From the `mobile` folder:

```
npm install
```

Create `mobile/.env.local` with the address of the backend (the computer's local IP address, the phone
must be on the same Wi-Fi network):

```
EXPO_PUBLIC_API_URL=http://<computer-ip>:8000
```

Start Expo and scan the QR code with Expo Go:

```
npx expo start -c
```

## Rebuilding the dataset (optional)

The repository already contains the images, metadata and embeddings. To recreate them:

```
python scripts/download_met.py        # reference images and metadata (Met Open Access API)
python scripts/apply_descriptions.py  # merge the written descriptions
python scripts/build_embeddings.py    # CLIP embeddings of the reference images
python scripts/import_artworks.py     # load the artworks into the database
```

## Evaluation

```
python scripts/make_labels.py    # prepare data/test_photos/labels.csv
python scripts/evaluate.py       # writes documentation/test-results.md and test-predictions.csv
python scripts/query_image.py path/to/photo.jpg   # top matches for a single photo
```

Test folders:

- `data/test_photos/` photos of reference artworks, labeled in `labels.csv`
- `data/test_photos/non_artworks/` photos that contain no reference artwork
- `data/test_photos/other_artworks/` famous artworks that are not in the reference set

The results are in `documentation/test-results.md`.

## Limitations

- The reference set has 60 paintings. An artwork outside this set can still be matched to a visually
  similar reference painting; a similarity threshold alone does not always reject it (see the test
  results).
- CLIP measures overall visual similarity, not whether two images show exactly the same work.

## Data and licenses

- Reference images and metadata: The Metropolitan Museum of Art Open Access program (CC0).
- The Turkish and English descriptions and the daily facts were drafted with the help of an AI
  assistant. They are checked against the museum records using the checklists in
  `documentation/description-verification.md` and `documentation/daily-facts-verification.md`.
  Entries that are not yet marked as verified should be treated as unverified.

  - National Museum in Wroclaw: 10 additional artworks (object ids from 900001) were added as a
  second museum. Their images are not part of this repository, because the images come from the
  museum's online collection (Google Arts & Culture) and were used for research only. The
  metadata and the embeddings are included. To use these artworks, put the images in
  `data/museum_import/images`, fill `data/museum_import/wroclaw.csv` and run
  `python scripts/add_museum_artworks.py`.
