Feature: Walking skeleton — play a solo game end to end
  # Slices covered: 01, 02
  # Personas: Sam, Priya, Jae
  # Driving port: browser page at canonical URL (pointer + render observable)
  # Seams exercised: render, bootstrap orchestration (maybeRunAi), win-detector
  # Scope note: slice 01+02 has NO mode toggle and NO difficulty selector.
  #             Those controls first appear in slices 04 and 05.
  # Evidence tier: C (illustrative practice exercise)

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL

  @priority:walking-skeleton @slice:01 @seam:render @tool:playwright
  @ac:US-01-empty-grid @ac:US-01-turn-indicator @ac:US-01-default-mode @ac:US-01-no-modal
  Scenario: Sam opens the page and sees a ready-to-play board
    Given Sam navigates to the tic-tac-toe URL on an evergreen browser
    When the page finishes first meaningful paint
    Then an empty 3x3 board is visible
    And the turn indicator reads "Your turn (X)."
    And the default mode is solo against a medium AI
    And no modal, signup prompt, or cookie wall blocks the board
    And the board is interactive within 500 milliseconds of page load

  @priority:walking-skeleton @slice:01 @seam:render @tool:playwright
  @ac:US-01-mobile-viewport
  Scenario: Priya opens the page on a narrow mobile viewport
    Given Priya arrives on a 360 pixel wide mobile device
    When the page finishes first meaningful paint
    Then the 3x3 grid is fully visible without horizontal scrolling
    And every cell is at least 44 by 44 CSS pixels

  @priority:walking-skeleton @slice:02 @seam:bootstrap @tool:playwright
  @ac:US-02-click-places-x @ac:US-02-ai-responds
  Scenario: Sam places an X with a click and the AI responds
    Given Sam sees an empty board in solo mode
    When Sam clicks the center cell
    Then an X appears in the center cell within 100 milliseconds
    And an O appears in a previously empty cell within 300 milliseconds
    And the turn indicator returns to "Your turn (X)."

  @priority:walking-skeleton @slice:02 @seam:win-detector @tool:playwright
  @ac:US-02-win-detection @ac:US-02-result-banner-solo @ac:US-02-play-again-focus
  Scenario: Sam completes a winning line and the result banner confirms the win
    Given Sam is playing solo against a medium AI
    And Sam has placed X in the top-left and top-middle cells
    And the top-right cell is empty
    When Sam places X in the top-right cell completing the top row
    Then the result banner reads "You win!"
    And the "Play again" button receives keyboard focus
    And the AI does not place any further mark

  @priority:walking-skeleton @slice:02 @seam:win-detector @tool:playwright
  @ac:US-02-ai-wins
  Scenario: Priya loses when the AI completes three in a row
    Given Priya is playing solo against the AI
    And the board is arranged so that the AI's next move completes three O in a row
    When the AI takes its turn
    Then the result banner reads "AI wins."
    And the "Play again" button receives keyboard focus

  @priority:walking-skeleton @slice:02 @seam:win-detector @tool:playwright
  @ac:US-02-draw-detection @ac:US-02-result-banner-solo
  Scenario: Priya and the AI fill the board with no winner
    Given Priya is playing solo and 8 cells are filled with no three-in-a-row
    When the final mark is placed and no line is completed
    Then the result banner reads "Draw."
    And the "Play again" button receives keyboard focus

  @priority:walking-skeleton @slice:02 @seam:render @tool:playwright
  @ac:US-02-no-op-on-filled-cell
  Scenario: Sam clicks a cell that is already filled and nothing changes
    Given Sam has placed X in the center cell
    When Sam clicks the center cell again
    Then the board has exactly one X in the center cell
    And no O is added in response
    And the turn indicator still reads "AI is thinking..." or "Your turn (X)."

  @priority:walking-skeleton @slice:02 @seam:render @tool:playwright
  @ac:US-02-play-again-resets
  Scenario: Sam starts a fresh game with Play again
    Given Sam has finished a solo game and the result banner is visible
    When Sam activates "Play again"
    Then the board is empty
    And the mode is still solo against a medium AI
    And the turn indicator reads "Your turn (X)."
    And the result banner is no longer visible

  @priority:walking-skeleton @slice:02 @seam:render @tool:playwright
  @ac:US-02-reload-fresh
  Scenario: Jae reloads mid-game and the session starts fresh
    Given Jae has a game in progress with several moves already played
    When Jae reloads the page
    Then the board is empty
    And the mode is solo against a medium AI
    And no partial game state from the previous session remains
