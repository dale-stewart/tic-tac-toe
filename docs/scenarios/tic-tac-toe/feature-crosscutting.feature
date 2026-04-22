Feature: Cross-cutting guardrails — privacy, bundle, and browser fallback
  # Personas: Priya (skeptical of tracking), Jae (on ancient browser)
  # Driving port: browser page at canonical URL + CI artifacts
  # Seams exercised: bootstrap, static-host boundary, CI gates
  # Scope note: Bundle-size and Lighthouse perf/a11y scores are CI-only gates
  #             (Lighthouse CI + axe-core). These scenarios REFERENCE those
  #             gates for traceability; they are not owned by Playwright.
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL

  @priority:walking-skeleton @slice:07 @seam:bootstrap @tool:network
  @ac:US-07-no-third-party
  Scenario: Zero third-party network requests are made when loading the page
    Given network interception is recording every request made by the page
    When Priya loads the tic-tac-toe URL
    Then every request goes to the same origin as the page itself
    And no request is made to any third-party host

  @priority:walking-skeleton @slice:07 @seam:bootstrap @tool:network
  @ac:US-07-no-third-party
  Scenario: No tracking cookies or beacons are set beyond the legal minimum
    Given Priya loads the page fresh with no prior cookies
    When the page has finished loading
    Then no analytics cookie, fingerprinting beacon, or third-party storage entry is created

  @priority:r1 @slice:01 @seam:render @tool:playwright
  @ac:US-01-fallback-message
  Scenario: Jae on an ancient browser sees a graceful fallback message
    Given Jae opens the page in a browser that lacks a required modern feature
    When the page attempts to load
    Then a message reading "This game needs a modern browser. Try Firefox, Chrome, Safari, or Edge." is shown
    And the message is announced to assistive technology
    And no broken UI is rendered below the message

  @priority:r1 @slice:crosscutting @seam:bootstrap @tool:playwright
  @ac:CSP-compliance
  Scenario: Content Security Policy rejects any inline script injection attempt
    Given Priya loads the page
    When the browser receives the response
    Then the Content Security Policy restricts script sources to the same origin
    And any attempt to execute an inline script from a third origin is blocked

  @priority:r2 @slice:crosscutting @seam:bootstrap @tool:lighthouse
  @ac:KPI-1-bundle
  Scenario: Production bundle stays within the 50 KB gzipped ceiling
    Given a production build has been produced by CI
    When the bundle size gate runs against the build output
    Then the total gzipped bundle is at most 50 kilobytes

  @priority:r2 @slice:crosscutting @seam:bootstrap @tool:lighthouse
  @ac:KPI-4-perf @ac:KPI-5-perf
  Scenario: Lighthouse performance score remains at or above 90
    Given a production build is deployed to the CI preview environment
    When Lighthouse CI audits the canonical URL
    Then the performance score is at least 90
    And the cumulative layout shift is at most 0.1
    And the first meaningful paint is at most 500 milliseconds

  @priority:r2 @slice:crosscutting @seam:render @tool:lighthouse
  @ac:KPI-3-a11y
  Scenario: Lighthouse accessibility score remains at or above 95
    Given a production build is deployed to the CI preview environment
    When Lighthouse CI audits the canonical URL
    Then the accessibility score is at least 95

  @priority:r2 @slice:07 @seam:render @tool:playwright
  @ac:US-07-no-runtime-js
  Scenario: Footer is implemented without adding new JavaScript
    Given the production bundle has been built
    When the bundle is measured before and after slice 07 changes
    Then no new JavaScript is added for the footer implementation
