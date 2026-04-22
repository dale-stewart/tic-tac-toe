Feature: Hot-seat mode for two players on one device
  # Slice covered: 05
  # Personas: Dale and Ben (two-human pair), Alex (keyboard-only)
  # Driving port: browser page — mode toggle (segmented control) + game board
  # Seams exercised: render (vocabulary branching on mode), bootstrap (AI-never-fires
  #                  in hot-seat), win-detector (SAME module as solo), announce
  # Scope note: hot-seat introduces a mode-toggle that REPLACES the difficulty
  #             selector when active. P1 always starts. No player naming in v1.
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL

  @priority:r1 @slice:05 @seam:render @tool:playwright
  @ac:US-05-toggle-visible
  Scenario: Dale finds the hot-seat toggle from solo mode
    Given Dale is in solo mode with no moves played
    When the page is rendered
    Then a mode toggle with options "Solo" and "Hot-seat" is visible and keyboard-focusable

  @priority:r1 @slice:05 @seam:render @tool:playwright
  @ac:US-05-switch-resets-board @ac:US-05-p1-vocabulary
  Scenario: Dale switches to hot-seat and sees P1 vocabulary
    Given Dale is in solo mode with no moves played
    When Dale activates the hot-seat toggle
    Then the board is empty
    And the mode is hot-seat
    And the turn indicator reads "P1's turn (X)."

  @priority:r1 @slice:05 @seam:bootstrap @tool:playwright
  @ac:US-05-no-ai-in-hot-seat @ac:US-05-turn-alternation
  Scenario: P1 places X and turn passes to P2 with no AI move
    Given hot-seat mode with an empty board
    When P1 clicks the center cell
    Then an X appears in the center cell within 100 milliseconds
    And the turn indicator reads "P2's turn (O)."
    And no O is placed automatically

  @priority:r1 @slice:05 @seam:bootstrap @tool:playwright
  @ac:US-05-no-ai-in-hot-seat
  Scenario: P2 places O and turn returns to P1 with no AI move
    Given hot-seat mode and P1 has placed X in the center cell
    When P2 clicks the top-left cell
    Then an O appears in the top-left cell within 100 milliseconds
    And the turn indicator reads "P1's turn (X)."
    And no O is placed automatically

  @priority:r1 @slice:05 @seam:win-detector @tool:playwright
  @ac:US-05-p1-wins-banner
  Scenario: P1 wins and the banner uses P1 vocabulary
    Given hot-seat mode with P1 having X in the top-left and top-middle cells
    And the top-right cell is empty
    When P1 places X in the top-right cell completing the top row
    Then the result banner reads "P1 wins!"
    And the "Play again" button receives keyboard focus
    And the mode toggle is re-enabled

  @priority:r1 @slice:05 @seam:win-detector @tool:playwright
  @ac:US-05-p2-wins-banner
  Scenario: P2 wins and the banner uses P2 vocabulary
    Given hot-seat mode with P2 having O in the center and middle-right cells
    And it is P2's turn with the middle-left cell empty
    When P2 places O in the middle-left cell completing the middle row
    Then the result banner reads "P2 wins!"
    And the "Play again" button receives keyboard focus

  @priority:r1 @slice:05 @seam:win-detector @tool:playwright
  @ac:US-05-draw-banner
  Scenario: Hot-seat game ends in a draw with the generic Draw banner
    Given hot-seat mode with 8 cells filled and no three-in-a-row
    When the final cell is filled and no line is completed
    Then the result banner reads "Draw."
    And the "Play again" button receives keyboard focus

  @priority:r1 @slice:05 @seam:bootstrap @tool:playwright
  @ac:US-05-toggle-disabled-mid-game
  Scenario: Mode toggle is disabled once play has started
    Given hot-seat mode with at least one move placed
    When Ben attempts to toggle back to solo
    Then the mode toggle is disabled
    And the current hot-seat game continues
    And the board state is preserved

  @priority:r1 @slice:05 @seam:render @tool:playwright
  @ac:US-05-rematch-keeps-mode
  Scenario: Play again preserves hot-seat mode
    Given a hot-seat game has just ended
    When the players activate "Play again"
    Then the board is empty
    And the mode is still hot-seat
    And the turn indicator reads "P1's turn (X)."

  @priority:r1 @slice:05 @seam:win-detector @tool:playwright
  @ac:US-05-shared-win-detector
  Scenario Outline: Hot-seat win detection recognises the same lines as solo
    Given hot-seat mode with the board arranged so that placing the final mark at <completing_cell> completes <line_name>
    When P<player> places the completing mark
    Then the winning line <line_name> is highlighted
    And the result banner reads "P<player> wins!"

    Examples:
      | completing_cell | line_name           | player |
      | top-right       | top row             | 1      |
      | bottom-middle   | middle column       | 2      |
      | bottom-right    | top-left diagonal   | 1      |
      | bottom-left     | top-right diagonal  | 2      |

  @a11y @priority:r1 @slice:05 @seam:render @tool:playwright
  @ac:US-05-keyboard-parity
  Scenario: Alex plays a full hot-seat game using only the keyboard
    Given Alex has switched to hot-seat mode
    When Alex navigates with arrow keys and places marks with Enter to a terminal state
    Then every cell is reachable via arrow keys
    And the game completes without a mouse
    And the result banner and focus behavior are identical to solo mode
