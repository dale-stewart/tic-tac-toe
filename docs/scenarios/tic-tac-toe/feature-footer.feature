Feature: No-ads trust footer and source link
  # Slice covered: 07
  # Personas: Priya (skeptical casual user), Marcus (uninterested in trust claim)
  # Driving port: browser page — rendered footer
  # Seams exercised: render (static content addition only)
  # Scope note: no JS added. Link opens repository in a new tab with
  #             rel="noopener noreferrer". Network-request assertion covered
  #             in feature-crosscutting.feature.
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL

  @priority:r2 @slice:07 @seam:render @tool:playwright
  @ac:US-07-footer-text
  Scenario: Priya sees the no-ads footer on first paint
    Given Priya loads the page on a 1280 by 800 viewport
    When first meaningful paint completes
    Then a footer reading "No ads. No signup. No tracking." is visible without scrolling

  @priority:r2 @slice:07 @seam:render @tool:playwright
  @ac:US-07-source-link-present
  Scenario: Priya sees a keyboard-focusable source link
    Given the footer is visible
    When Priya Tabs to the "[source]" link
    Then the link is focused with a visible focus indicator
    And the link destination resolves to the canonical public repository URL

  @priority:r2 @slice:07 @seam:render @tool:playwright
  @ac:US-07-new-tab-noopener
  Scenario: Priya activates the source link and it opens in a new tab safely
    Given the "[source]" link is focused
    When Priya activates the link
    Then the public repository URL opens in a new tab
    And the opened tab has rel="noopener noreferrer"

  @priority:r2 @slice:07 @seam:render @tool:playwright
  @ac:US-07-footer-above-fold
  Scenario: The footer stays visible on small viewports without competing with the board
    Given Marcus loads the page on a 1280 by 800 viewport
    When first meaningful paint completes
    Then both the 3x3 board AND the footer are visible without scrolling
