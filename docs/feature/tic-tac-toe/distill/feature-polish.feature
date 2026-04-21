Feature: Polish — winning-line animation and color-blind-safe palette
  # Slice covered: 06
  # Personas: Sam, Priya (reduced-motion), generic deuteranopic user
  # Driving port: browser page — rendered DOM + CSS animation
  # Seams exercised: render (winningLine consumer), no new state
  # Scope note: animation consumes winningLine artifact. prefers-reduced-motion
  #             must be honored. X and O must be distinguishable by shape alone.
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL

  @priority:r2 @slice:06 @seam:render @tool:playwright
  @ac:US-06-animation-within-500ms
  Scenario: Sam sees the winning line animate across three cells
    Given Sam has just completed a winning line
    When the terminal state is reached
    Then an animated line is drawn across the three winning cells
    And the animation completes within 500 milliseconds
    And no layout shift occurs during the animation

  @priority:r2 @slice:06 @seam:render @tool:playwright
  @ac:US-06-reduced-motion
  Scenario: Priya with reduced-motion preference sees a static win highlight
    Given Priya has the system preference "prefers-reduced-motion: reduce" enabled
    When Priya completes a winning line
    Then the winning three cells are highlighted as a static overlay
    And no animation plays

  @priority:r2 @slice:06 @seam:render @tool:playwright @property
  @ac:US-06-shape-distinguishable
  Scenario: X and O are distinguishable by shape without color
    Given any game state with both X and O marks on the board
    When the rendered page is captured and inspected under a simulated color-blind filter
    Then X and O remain distinguishable by shape alone

  @priority:r2 @slice:06 @seam:render @tool:axe
  @ac:US-06-no-a11y-regression
  Scenario: Polish slice does not regress accessibility
    Given the app has shipped through slice 06
    When axe-core runs against the four canonical states (empty, mid-game, won, draw)
    Then zero accessibility violations are reported on every state

  @priority:r2 @slice:06 @seam:render @tool:playwright
  @ac:US-06-text-contrast
  Scenario: Text and UI-element contrast meet WCAG thresholds
    Given Sam is on a game in progress
    When the rendered page is inspected
    Then all body text meets a 4.5 to 1 contrast ratio
    And all UI-element boundaries meet a 3 to 1 contrast ratio

  @priority:r2 @slice:06 @seam:render @tool:playwright
  @ac:US-06-cls-budget
  Scenario: Winning-line animation does not shift layout
    Given Sam completes a winning line
    When the animation plays to completion
    Then the cumulative layout shift observed during the animation is at most 0.1
