# Dataset Notes

## Source
- Collection: The Metropolitan Museum of Art, Open Access program
- API: https://collectionapi.metmuseum.org (endpoint `/v1.1/search` and `/v1/objects/{id}`)
- Documentation: https://metmuseum.github.io/
- License: CC0 (public domain dedication, usable for research and commercial purposes)
- Retrieved on: 12 October 2026

## Selection criteria
- Department: European Paintings (department ID 11)
- Only objects flagged `isPublicDomain = true`
- Only objects flagged as highlights and having an image
- Classification must contain "Painting"
- At most 2 artworks per artist, to keep the dataset diverse
- Total: 60 artworks

## Files
- Images: `data/images/{object_id}.jpg` (the "web-large" version provided by the API)
- Metadata: `data/metadata/artworks.json`
- Total image size: about 6,47066402435303 MB
- Download script: `scripts/download_met.py`

## Metadata fields
object_id, title, artist, year, type (medium), museum, department, image_file, source_url, license, description_tr, description_en

## Notes
- `description_tr` and `description_en` are not provided by the Met API. They are written separately and
  verified against the museum's own page for each artwork (see `source_url`).
- Test photographs (taken with a phone) are kept separate from this reference dataset.