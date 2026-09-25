# ARTWORK RECOGNITION - UI SCREEN FLOW & ARCHITECTURE

## 1. Welcome / Login Screen
- Email input field (TextField)
- Password input field (SecureField)
- "Login" button
- "Don't have an account? Register" link

## 2. Create Account (Register) Screen
- Full Name input field (TextField)
- Email input field (TextField)
- Password input field (SecureField)
- Confirm Password input field (SecureField)
- "Create Account" button

## 3. Home Screen
- Welcome banner (e.g., "Welcome, User!")
- 3 Main Navigation Buttons/Cards:
  1. Identify Artwork
  2. History
  3. Profile
- Logout button

## 4. Identify Artwork Screen
- Image selection / Camera capture placeholder
- Selected image preview
- "Recognize Artwork" button

## 5. Loading Screen
- Activity indicator / Spinner animation
- "Analyzing artwork..." status text

## 6. Result Screen
- Artwork image preview
- Title (e.g., "Mona Lisa")
- Artist (e.g., "Leonardo da Vinci")
- Year (e.g., "1503")
- Museum (e.g., "Louvre Museum")
- Language selector toggle (Turkish / English)
- Artwork description text (TR / EN)
- "Back to Home" button

## 7. History Screen
- List of previously recognized artworks
- List Item: Thumbnail, Artwork Title, Recognition Timestamp
- Tap to navigate to Result Screen detail

## 8. Profile Screen
- User Name & Email display
- Preferred Language settings
- Logout button

---
### Navigation Flow Architecture
Login / Register ──> Home ──┬──> Identify ──> Loading ──> Result
                           ├──> History
                           └──> Profile