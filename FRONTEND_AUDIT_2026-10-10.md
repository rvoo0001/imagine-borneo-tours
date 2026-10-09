# Frontend audit — 10 October 2026

## Current stage

Assessment: an implemented catalogue MVP undergoing integration and quality assurance, not yet release-ready. Customer pages, a FastAPI catalogue backend, image management, contact storage, and admin screens exist. The local database returns 5 tours and 7 animals. Booking, payment, and an admin contact-message inbox were not found in the inspected frontend; whether these are required depends on the intended product scope.

The frontend directory is currently untracked in the parent Git repository. Existing backend changes and the contact router also remain uncommitted. The root README is still a starter template. This assessment concerns the local working tree, not a deployed environment.

## Checks actually run

| Check | Result |
| --- | --- |
| `npm run build` | PASS: client and server production bundles generated in `frontend/tanstack_frontend/dist`. |
| `npx tsc --noEmit` | FAIL: 6 diagnostics across admin tours, admin layout, and two demo files. |
| `npm run lint` | FAIL: 61 errors and 11 warnings. Includes configuration parsing, generated-code style, imports, array style, unnecessary conditions, and shadowed variables. |
| `npm test` | FAIL: no test files found; there is no existing automated regression suite. |
| Default production preview | Shell renders, but catalogue requests fail. `/tours/` returned HTTP 500; preview logs show proxy connection failures to its configured backend. |
| Backend on an available local port | PASS: FastAPI starts on 127.0.0.1:8002; tours and animals return HTTP 200 with existing records. |
| Browser checks with temporary backend routing | Core catalogue interactions pass; mobile and keyboard issues found below. |

Node is 20.17.0. Installed Vite 7.2.4 reports that it requires Node 20.19+ or 22.12+. This build happened to succeed despite the warning; the runtime version still needs aligning.

Port 8000 initially served an unrelated Django application, and 8001 served another application. Neither was stopped. Browser success checks used a temporary Vite configuration routing API traffic to 8002 and a matching image base URL. The original configuration was not changed. Passing those checks does not mean the default startup configuration is working.

## Component and page coverage

“Reviewed” means source inspection, not a successful browser interaction test. “Partial” explicitly leaves the listed flow unverified.

| Component/page | Result and evidence |
| --- | --- |
| Root document, router, query provider | Renders and loads data with corrected routing. Page title still says `TanStack Start Starter`. Production devtools are removed by the build. |
| Header | Mobile menu opens, navigates to About Us, and closes. Desktop links render. At the approximately 966px browser width, branding and navigation wrap awkwardly. Scroll-hide behavior was not separately certified. |
| Footer | Rendered across inspected pages; link destinations inspected. Every footer link was not individually clicked. |
| Homepage | Real recommendations, wildlife strip, featured cards, and calls to action render. API-failure messages verified in the default preview. |
| RecommendedToursCarousel | Next/previous actions exercised; active-dot class changes verified. Real images load. FAIL on mobile: 45%-width text panel clips the long tour heading and crowds content at 390px. |
| AnimalsMarquee | Real wildlife images and repeated links render; movement visible across observations. Hover pause and loop seam not separately verified. |
| TourCard | Homepage cards render names, prices, wildlife, and detail links from real data. This differs from the listing page's internal card component. |
| ToursPage / TourListingCard | PASS: 5 records load. Searching Kinabatangan yields one; clearing restores all. Elephant filter yields two. Price-low sorting yields 320, 650, 850, 980, 50000. Setting maximum to 320 leaves the Night Walk. Clicking its card opens its details. Filter panel expands. |
| TourDetailPage / WildlifeSection / AnimalImage | PASS for tour 6: description, RM 320, two animals, 25% and 15% probabilities, and images render. Invalid nonnumeric tour ID displays a recovery message and Back to tours link. |
| TourGallery | Reviewed. Existing tours have only their cover image, so extra-image gallery layout could not be exercised with the current records. |
| AnimalsPage / AnimalImage | PASS: catalogue loads; Elephant search yields Elephant and Bornean Pygmy Elephant. |
| Animal detail dialog | Opens and closes using its button. FAIL: Escape leaves it open. Focus remains on the underlying View details control when opened; source has no focus management/trap. |
| AboutUsPage | PASS: rendered via mobile navigation with 7 animals, 5 recommended journeys, background image, and content. |
| ContactPage | Form renders. Whitespace-only name is rejected with the expected alert. Successful submission/storage and server-error handling were not exercised; no message was sent. |
| AdminLoginPage / AdminAuthProvider | PASS for unauthenticated redirect from `/admin/tours`, blank-password validation, and invalid-password rejection from the correct backend. Successful login, persisted session, and logout were not exercised. |
| AdminLayout | Reviewed; TypeScript error from destructuring `exact` when two navigation items do not declare it. Protected-route redirect tested as above. |
| AdminOverviewPage / StatCard | Reviewed. Authenticated totals and navigation remain unverified. |
| AdminToursPage | Reviewed; has 3 TypeScript diagnostics and a missing guard after nullable animal-link validation. Create/update/delete, cover selection, upload, and removal remain unverified. |
| AdminAnimalsPage | Reviewed. Create/update/delete/upload/removal remain unverified. Upload/removal invalidates the list but leaves the selected `editing` object unchanged, so its image panel can remain stale until reselected. |
| AnimalFilterPopover | Reviewed, but no route imports it. Not reachable in the current app; its selection/search interactions are unverified. The current catalogue uses different filter controls. |
| UI Slider | Reviewed, but no route imports it. Not reachable; the tested catalogue price controls are native range inputs. |
| Simple_Navbar | Unused JSX fragment without an exported component. It is not the live navigation implementation. |
| Starter demo routes | Seven demo page URLs were navigated as smoke checks. They are still shipped. Full behavior was not verified; two demo files fail the TypeScript check. |

No broken loaded homepage images were detected in the mobile DOM check with the corrected image base. This is not a comprehensive asset, accessibility, or cross-browser audit.

## Issues to resolve before release

1. **Backend routing and runtime setup.** `vite.config.ts` hardcodes localhost:8000. The generated API client uses relative URLs, while `src/lib/env.ts` applies `VITE_API_BASE_URL` to image URLs only. Changing that variable alone will not redirect API calls. Supply a consistent development and deployment routing arrangement and a supported Node version.
2. **Admin tour validation.** `src/routes/admin.tours.tsx:79` does not stop when `buildAnimalLinks()` returns null. The handler then clears the validation error and uses that value in the payload or accesses `links.length`. Guard this before any save or association updates. This is supported by source review and the compiler, not a destructive browser reproduction.
3. **Mobile carousel.** `src/components/RecommendedToursCarousel.tsx:73` constrains the information panel to 45% even on phones. The real heading is visibly clipped. Use a mobile-specific layout and verify long content.
4. **Wildlife dialog keyboard access.** `src/routes/animals.tsx:41` needs Escape dismissal, initial focus, focus containment, and restoration.
5. **Admin animal images.** Refresh the selected editing record after successful image mutations, not just the list query.
6. **Quality gates.** Fix the remaining admin/demo type errors, align ESLint configuration and generated-code policy, and add meaningful tests. The build script does not run the type checker, which explains the green build alongside compiler errors.
7. **Release polish and coverage.** Replace starter metadata, decide whether to remove demo/unused components, verify authenticated editing and contact persistence on disposable test data, test extra-image galleries, and finish responsive coverage. The RM 50,000 turtle tour is real stored data; confirm it is intentional.

## Audit limits and changes

This was a diagnostic review. No application fixes were applied. Existing user edits were preserved. No tours, animals, images, or contact messages were changed through the UI. Starting the existing backend runs its normal `metadata.create_all` initialization. Temporary audit configuration and processes were cleaned up after testing. Production build output remains available, and this report is the only intentional new project document.
