Feature: AI difficulty levels
  # Slice covered: 04
  # Personas: Marcus, Jae
  # Driving port: browser page — difficulty control (ARIA radio-group pattern)
  # Seams exercised: AI interface (uniform signature), bootstrap orchestration
  # Scope note: the disable-mid-game rule is introduced here (also applies to
  #             hot-seat toggle in slice 05). Easy / medium / perfect are three
  #             pure functions sharing signature (boardState, mark) → [row, col].
  # Evidence tier: C

  Background:
    Given the tic-tac-toe single-page web app is reachable at its canonical URL
    And the default difficulty is medium

  @priority:r1 @slice:04 @seam:render @tool:playwright
  @ac:US-04-visible-control @ac:US-04-default-medium
  Scenario: Marcus sees the difficulty control with medium selected by default
    Given Marcus loads the page in solo mode
    When the page finishes first meaningful paint
    Then a difficulty control with three options "easy", "medium", "perfect" is visible
    And "medium" is selected by default

  @priority:r1 @slice:04 @seam:render @tool:playwright
  @ac:US-04-keyboard-activation @ac:US-04-announce-difficulty
  Scenario: Marcus switches difficulty to perfect using the keyboard
    Given Marcus has finished a game in solo mode
    When Marcus selects the "perfect" difficulty option via keyboard
    Then the "perfect" option is visually indicated as selected
    And the ARIA live region announces "Difficulty: perfect" within 1 second

  @priority:r1 @slice:04 @seam:bootstrap @tool:playwright
  @ac:US-04-disabled-mid-game
  Scenario: Marcus cannot change difficulty mid-game
    Given Marcus has placed at least one X and the game is in progress
    When Marcus attempts to change difficulty to "perfect"
    Then the difficulty control is disabled
    And the current game continues with the originally selected difficulty

  @priority:r1 @slice:04 @seam:bootstrap @tool:playwright
  @ac:US-04-reenabled-at-terminal
  Scenario: Difficulty control becomes available again when a game ends
    Given Marcus has reached a terminal state in a solo game
    When the result banner is visible
    Then the difficulty control is enabled

  @priority:r1 @slice:04 @seam:ai @tool:playwright
  @ac:US-04-medium-blocks
  Scenario: Medium AI blocks Marcus's immediate three-in-a-row threat
    Given Marcus is playing on medium difficulty
    And Marcus has placed X in the top-left and top-middle cells
    And the top-right cell is empty and no other move is immediately threatening
    When the AI takes its turn
    Then an O appears in the top-right cell

  @priority:r1 @slice:04 @seam:ai @tool:playwright
  @ac:US-04-medium-completes
  Scenario: Medium AI completes its own winning line when available
    Given Marcus is playing on medium difficulty
    And the AI has O in the top-left and top-middle cells
    And the top-right cell is empty
    When the AI takes its turn
    Then an O appears in the top-right cell

  @priority:r1 @slice:04 @seam:ai @tool:vitest-property @property
  @ac:US-04-perfect-never-loses
  Scenario: Perfect AI never loses over 100 random games
    Given the perfect AI is challenged with 100 independently seeded random-move games
    When each game is played to completion against a random-move opponent
    Then for every game the perfect AI outcome is either "perfect wins" or "draw"
    And no game results in the perfect AI losing

  @priority:r1 @slice:04 @seam:ai @tool:vitest-property @property
  @ac:US-04-shared-signature
  Scenario: Every difficulty implementation answers the same question in the same shape
    Given any legal in-progress board and any player mark
    When each of easy, medium, and perfect is asked for a move
    Then each returns a coordinate that refers to an empty cell on the given board

  @priority:r1 @slice:04 @seam:render @tool:playwright
  @ac:US-04-persist-across-play-again
  Scenario: Selected difficulty persists across Play again within a session
    Given Marcus has selected "perfect" and completed a game
    When Marcus activates "Play again"
    Then the new game begins on "perfect" difficulty
    And "perfect" remains visually indicated as selected

  @priority:r1 @slice:04 @seam:ai @tool:playwright
  @ac:US-04-easy-random
  Scenario: Easy AI plays into empty cells only
    Given Jae is playing on easy difficulty
    When Jae plays 20 moves and the AI responds each time
    Then every AI move lands on a cell that was empty immediately before that move
