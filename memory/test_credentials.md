# Test Credentials — Radha Imitation Jewellery (Next.js)

## Auth model
- Customer accounts are handled by WordPress (WPGraphQL JWT) once a store is connected.
- **Until WordPress is connected (current state):** the auth fallback accepts ANY valid input
  (any email + password of 6+ chars). Registering/logging in sets an httpOnly session cookie.
- There is no separate admin panel anymore — the catalogue is managed in WordPress wp-admin.

## Example preview login
- Name: QA Buyer
- Email: qa@test.com
- Password: secret123
