Feature: Hot-seat pair play on one device
  # Platform: web
  # Persona: Hot-Seat Pair (two humans, same device)
  # Emotional arc: Curious -> Alternating focus -> Shared closure
  # Evidence tier: C (illustrative, carried forward from DISCOVER)
  # Accessibility: WCAG 2.2 AA

  Background:
    Given the tic-tac-toe single-page web app is deployed at the canonical URL
    And the default mode is "solo vs AI: medium"

  Scenario: Switching to hot-seat mode resets the board
    Given the player is in solo vs AI mode
    When the player activates the hot-seat toggle before making a move
    Then the board is empty
    And the mode is "hot-seat"
    And the turn indicator reads "P1's turn (X)."

  Scenario: Mode toggle becomes unavailable once a move is placed
    Given the player is in hot-seat mode and P1 has placed X
    When the player attempts to toggle back to solo mode
    Then the toggle is disabled
    And the current game continues
    And the board state is preserved

  Scenario: P1 places X and turn passes to P2
    Given hot-seat mode with an empty board
    When P1 clicks the center cell
    Then an X appears in the center cell within 100 milliseconds
    And the turn indicator reads "P2's turn (O)."
    And a screen reader announces "P1 placed X at row 2, column 2. P2's turn."

  Scenario: P2 places O and turn returns to P1
    Given hot-seat mode and P1 has placed X in the center
    When P2 clicks the top-left cell
    Then an O appears in the top-left cell within 100 milliseconds
    And the turn indicator reads "P1's turn (X)."
    And no AI move is triggered

  Scenario: P1 wins with three X in a row
    Given hot-seat mode with two X in a row and it is P1's turn
    When P1 places the third X completing the line
    Then the winning line is highlighted
    And the result banner reads "P1 wins!"
    And the "Play again" button receives keyboard focus
    And the mode toggle is re-enabled

  Scenario: P2 wins with three O in a row
    Given hot-seat mode with two O in a row and it is P2's turn
    When P2 places the third O completing the line
    Then the winning line is highlighted
    And the result banner reads "P2 wins!"
    And the "Play again" button receives keyboard focus

  Scenario: Hot-seat game ends in a draw
    Given hot-seat mode with 8 cells filled and no three-in-a-row
    When the final cell is filled and no line is completed
    Then the result banner reads "Draw."
    And the "Play again" button receives keyboard focus

  Scenario: Rematch keeps hot-seat mode
    Given a hot-seat game has just ended
    When the players activate "Play again"
    Then the board is empty
    And the mode is still "hot-seat"
    And the turn indicator reads "P1's turn (X)."

  @a11y
  Scenario: Hot-seat game playable with keyboard only
    Given two players share one keyboard
    When they navigate with Tab and arrow keys and place moves with Enter
    Then every cell is reachable via arrow keys
    And focus indicators are visible throughout
    And the game can be completed without a mouse
