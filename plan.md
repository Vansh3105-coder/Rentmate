# Nestly — Auth and owner listing milestone

## Scope

Preserve the existing landing page and add the first working product layer: Manus OAuth sign-in, a required common profile step, owner verification, and a protected owner dashboard where a signed-in owner can create and manage property listings. This milestone intentionally stops before renter applications, payments, messaging, and advanced search.

## Implementation approach

- Enable the managed Server and Database capabilities already approved by the owner.
- Preserve the starter Manus OAuth flow, `webdev_app_session` cookie, CSRF nonce binding, and `useAuth` hook.
- Use the same OAuth entrypoint for sign-in and sign-up, then route incomplete accounts through `/onboarding` to collect name, email, contact number, and renter/owner intent.
- For owner intent, require a property type and one PDF/JPG/PNG proof document. Upload the document through the trusted server into managed storage and persist only a stable object reference plus pending review metadata; never store raw ID numbers as plain text.
- Extend the Drizzle schema with a `properties` table owned by the authenticated user. Store listing title, property type, city/locality, monthly rent, bedrooms, furnishing, short description, image URL, status, and timestamps.
- Add server-side database helpers and protected tRPC procedures to list the current owner’s properties and create, update, publish, or archive their own listings. Enforce ownership from the authenticated session on every mutation/query.
- Add `/onboarding` and `/owner` routes. The owner dashboard has a sign-in/onboarding gate, summary cards, listing table/cards, create-listing form, edit/publish/archive actions, and logout action. Use the existing warm olive-sage visual system and responsive layout.
- Keep `/` as the public landing page and add `/onboarding` and `/owner` to the route manifest. Public visitors can reach these routes but see the real login/onboarding flow until eligible.
- Use a deterministic migration for the new table and run the project checks/build after implementation.

## Project structure

- `client/src/pages/Onboarding.tsx`: common profile setup and owner proof submission UI.
- `client/src/pages/OwnerDashboard.tsx`: protected dashboard UI and listing form.
- `client/src/App.tsx`: public landing, onboarding, and owner routes.
- `server/routers.ts`: profile onboarding, proof upload, and protected owner listing procedures.
- `server/db.ts`: profile, verification, and owner listing queries/mutations.
- `drizzle/schema.ts`: users, properties, and owner verification tables.
- `drizzle/migrations/`: additive properties-table migration.
- `client/src/index.css`: dashboard styling and responsive states.
- `public/manus-routes.json` equivalent: served route manifest under `client/public/`.

## Design direction

**Selected style: quiet editorial workspace.** Probability 0.07.

- **Design movement:** calm editorial hospitality meets lightweight property operations dashboard.
- **Core principles:** clear ownership, low-friction entry, generous whitespace, and visible progress.
- **Color philosophy:** reuse the warm ecru, muted olive-sage, charcoal, and soft clay palette from the landing page so the product feels like one brand.
- **Layout paradigm:** a slim dashboard rail with a spacious content canvas, replacing dense admin grids with grouped cards and clear hierarchy.
- **Signature elements:** warm clay action buttons, soft olive status chips, and property cards with quiet image-led hierarchy.
- **Interaction philosophy:** real auth gates, optimistic-feeling feedback through toasts, and forms that make the next action obvious.
- **Animation:** short fade/slide transitions for route entry and listing creation; respect reduced-motion preferences.
- **Typography:** Newsreader for editorial titles and DM Sans for controls/data.
- **Brand essence:** a calmer way for owners to present places people can genuinely want to live in; thoughtful, clear, human.
- **Brand voice:** direct, warm, and specific. Example lines: “Give your place the context it deserves.” and “A good listing starts with the details people actually need.”
