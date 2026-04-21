Feature: Solo player completes a game against AI
  # Platform: web
  # Persona: Casual-Idle-Time Player
  # Emotional arc: Curious -> Focused -> Satisfied
  # Evidence tier: C (illustrative, carried forward from DISCOVER)
  # Key heuristics: Visibility of system status, Match system and real world,
  #                 User control and freedom, Error prevention, Help users
  #                 recognize/recover from errors
  # Accessibility: WCAG 2.2 AA (keyboard-only, ARIA live, color-blind-safe)

  Background:
    Given the tic-tac-toe single-page web app is deployed at the canonical URL
    And the default mode is "solo vs AI: medium"

  Scenario: Board is ready to play on first paint
    Given a casual player navigates to the tic-tac-toe URL
    When the page finishes its first meaningful paint
    Then an empty 3x3 board is visible
    And the turn indicator reads "Your turn (X)."
    And the default mode is "solo vs AI: medium"
    And no modal or signup prompt blocks interaction
    And the board is interactive within 500 milliseconds of URL load

  Scenario: Human places X on an empty cell with a mouse
    Given an empty board and it is the human's turn
    When the human clicks the center cell
    Then an X appears in the center cell within 100 milliseconds
    And the turn indicator reads "AI is thinking..."
    And a screen reader announces "X placed at row 2, column 2"

  Scenario: Human places X on an empty cell with the keyboard
    Given an empty board and it is the human's turn
    And the top-left cell is focused
    When the human presses Enter
    Then an X appears in the top-left cell within 100 milliseconds
    And focus remains on the top-left cell
    And a screen reader announces "X placed at row 1, column 1"

  Scenario: AI responds with a valid O move
    Given the human has just placed X and the game is not over
    When the AI takes its turn
    Then an O appears in a previously empty cell within 300 milliseconds
    And the turn indicator reads "Your turn (X)."
    And a screen reader announces the AI's move with row and column

  Scenario: Clicking an already-filled cell is a safe no-op
    Given the center cell contains an X
    When the human clicks the center cell again
    Then the board state does not change
    And a screen reader announces "Cell already taken"
    And the turn indicator does not change

  Scenario: Human wins with three X in a row
    Given the board has two X in a horizontal row and it is the human's turn
    And the third cell of that row is empty
    When the human places the third X completing the line
    Then the winning line is highlighted with an animated overlay
    And the result banner reads "You win!"
    And the "Play again" button receives keyboard focus
    And a screen reader announces "You win."
    And the AI does not place any further mark

  Scenario: AI wins with three O in a row
    Given the board is configured such that the AI's next move completes three O in a row
    When the AI takes its turn
    Then the winning line is highlighted
    And the result banner reads "AI wins."
    And the "Play again" button receives keyboard focus
    And a screen reader announces "AI wins."

  Scenario: Game ends in a draw
    Given the board has 8 cells filled with no three-in-a-row
    When the human places the final mark and no line is completed
    Then the result banner reads "Draw."
    And the "Play again" button receives keyboard focus
    And a screen reader announces "Draw."

  Scenario: Play again resets at the same difficulty
    Given the previous game has ended and the result banner is visible
    And the mode was "solo vs AI: medium"
    When the player activates "Play again"
    Then the board is empty
    And the mode remains "solo vs AI: medium"
    And the turn indicator reads "Your turn (X)."
    And the result banner is no longer visible
    And the re-render completes within 100 milliseconds

  Scenario: Reload mid-game starts a new game (v1 does not persist state)
    Given a game is in progress with several moves already played
    When the player reloads the page
    Then an empty 3x3 board is visible
    And the mode is "solo vs AI: medium"
    And no partial game state from the previous session remains

  @a11y
  Scenario: Full game playable with keyboard only
    Given the player uses only a keyboard
    When the player navigates with Tab and arrow keys, places moves with Enter, and reaches a terminal state
    Then every cell is reachable via arrow keys
    And focus indicators are visible on every interactive element
    And the game can be completed without a mouse

  @a11y
  Scenario: Color is not the sole indicator of state
    Given the player is using a color-blind-safe browser filter
    When X and O marks are placed
    Then X and O are distinguishable by shape, not only color
    And the winning line is identifiable by a non-color cue (thickness or animation)
