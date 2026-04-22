Feature: Keyboard navigation and ARIA live-region baseline
  # Slice covered: 03
  # Personas: Alex (NVDA screen-reader user), Dana (sighted keyboard-only user)
  # Driving port: browser page — keyboard events + ARIA live region DOM
  # Seams exercised: announce adapter, input/keyboard adapter, render focus management
  # Scope note: axe-core assertions run against four canonical states:
  #             empty, mid-game, won, draw.
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL
    And Dana is using only a keyboard

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-arrow-navigation
  Scenario: Dana moves focus between cells with arrow keys without wrapping
    Given the top-left cell is focused
    When Dana presses the Left arrow key
    Then focus remains on the top-left cell
    And the viewport does not scroll

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-arrow-navigation
  Scenario Outline: Dana navigates the grid with arrow keys
    Given the <start_cell> cell is focused
    When Dana presses the <direction> arrow key
    Then focus moves to the <expected_cell> cell

    Examples:
      | start_cell   | direction | expected_cell |
      | top-left     | Right     | top-middle    |
      | top-middle   | Down      | center        |
      | center       | Left      | middle-left   |
      | bottom-right | Up        | middle-right  |

  @priority:r1 @slice:03 @seam:bootstrap @tool:playwright
  @ac:US-03-enter-places-mark
  Scenario: Dana places a mark with the Enter key on a focused empty cell
    Given Dana has focused the top-left cell on an empty board
    When Dana presses Enter
    Then an X appears in the top-left cell within 100 milliseconds
    And focus remains on the top-left cell

  @priority:r1 @slice:03 @seam:bootstrap @tool:playwright
  @ac:US-03-space-places-mark
  Scenario: Dana places a mark with the Space key on a focused empty cell
    Given Dana has focused the center cell on an empty board
    When Dana presses Space
    Then an X appears in the center cell within 100 milliseconds

  @priority:r1 @slice:03 @seam:announce @tool:playwright
  @ac:US-03-cell-taken-announcement
  Scenario: Alex hears "Cell already taken" when pressing Enter on a filled cell
    Given Alex has placed X in the center cell
    And the center cell is focused
    When Alex presses Enter
    Then the ARIA live region announces "Cell already taken" within 1 second
    And the board is unchanged

  @priority:r1 @slice:03 @seam:announce @tool:playwright
  @ac:US-03-state-change-announcements
  Scenario: Alex hears every move announced with row and column
    Given Alex is playing a solo game and the live region is connected
    When Alex places X at row 2 column 2
    Then the ARIA live region announces Alex's move including row and column within 1 second
    And when the AI responds, the live region announces the AI move including row and column within 1 second

  @priority:r1 @slice:03 @seam:announce @tool:playwright
  @ac:US-03-result-announcements
  Scenario: Alex hears the game result announced when the game ends
    Given Alex is playing solo and the game reaches a terminal state with Alex winning
    When the result banner appears
    Then the ARIA live region announces "You win." within 1 second

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-terminal-focus-move
  Scenario: Focus moves to Play again when the game ends
    Given Alex is playing solo and reaches a terminal state
    When the result banner appears
    Then keyboard focus is on the "Play again" button
    And pressing Enter activates "Play again"

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-tab-order
  Scenario: Tab order follows cells in reading order then Play again
    Given Dana is on a board with a terminal state result banner showing
    When Dana presses Tab repeatedly from the beginning of the page
    Then focus reaches each of the nine cells in reading order
    And then focus reaches the "Play again" button

  @priority:r1 @slice:03 @seam:render @tool:axe
  @ac:US-03-axe-empty
  Scenario: Empty board passes axe-core with zero violations
    Given Dana loads the page with an empty board
    When an automated accessibility audit runs against the rendered page
    Then zero accessibility violations are reported

  @priority:r1 @slice:03 @seam:render @tool:axe
  @ac:US-03-axe-mid-game
  Scenario: Mid-game board passes axe-core with zero violations
    Given Dana is in solo mode with four cells filled and the game still in progress
    When an automated accessibility audit runs against the rendered page
    Then zero accessibility violations are reported

  @priority:r1 @slice:03 @seam:render @tool:axe
  @ac:US-03-axe-won
  Scenario: Won-game page passes axe-core with zero violations
    Given Dana has completed a solo game with a winning line visible and result banner "You win!"
    When an automated accessibility audit runs against the rendered page
    Then zero accessibility violations are reported

  @priority:r1 @slice:03 @seam:render @tool:axe
  @ac:US-03-axe-draw
  Scenario: Draw-state page passes axe-core with zero violations
    Given Dana has reached a draw with the result banner "Draw."
    When an automated accessibility audit runs against the rendered page
    Then zero accessibility violations are reported

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-focus-visible
  Scenario: Every interactive element shows a visible focus indicator
    Given Dana is on a game in progress
    When Dana Tabs to each interactive element in turn
    Then each focused element displays a visible focus indicator
    And the focus indicator meets a 3 to 1 contrast ratio against its background

  @priority:r1 @slice:03 @seam:render @tool:playwright
  @ac:US-03-no-keyboard-trap
  Scenario: No keyboard trap exists anywhere in the page
    Given Dana is anywhere on the page
    When Dana presses Tab and Shift plus Tab repeatedly
    Then focus cycles through all interactive elements and returns to the browser chrome
