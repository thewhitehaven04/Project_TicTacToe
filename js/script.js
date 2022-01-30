const body = document.querySelector('body');
const cellModel = function () {
  let value = null;

  /** Returns the value of the cell.
   * @returns {Number} value - the value of the cell
   */
  const getCell = function () {
    return value;
  };

  /** Sets the value to valueToSet
   * @param {String} valueToSet - value to be assigned
   */
  const setCell = function (valueToSet) {
    if (value == null) value = valueToSet;
    else throw 'This cell has already been assigned to.';
  };

  return { getCell, setCell };
};

const cellView = function (value, className) {
  const element = document.createElement('div');

  /** Creates the div element with the assigned text value. */
  function render() {
    element.classList.add(className);
    element.textContent = value;
    return element;
  }

  const addMarkCellListener = (markHandler) => {
    element.addEventListener('click', (event) => markHandler());
  };

  /** Assign the value to the cell.
   * @param {String} value - the value being assigned.
   */
  const setCell = (value) => (element.textContent = value);

  return { render, setCell, addMarkCellListener };
};

/** Returns an object containing the cell's view and model. */
const cellController = function (notifier) {
  const view = cellView('', 'board__cell');
  const model = cellModel();

  /** Stores the value to be assigned next to the both the model and the view. */
  let nextValue;

  /** Update the cell value both in the model and the view with the nextValue.
   * nextValue is updated depending on which player is to make a move next.*/
  const updateCell = function () {
    model.setCell(nextValue);
    view.setCell(nextValue);
    notifier.notify('move');
  };

  /** Updates the value that is to be assigned to the cell in the next move.
   * @param {String} value - the value to be assigned.*/
  const updateNextValue = (value) => (nextValue = value);

  view.addMarkCellListener(updateCell);

  const obj = {
    updateNextValue,
    cellView: view,
    cellModel: model,
  };
  return obj;
};

const welcomeDialog = (function (bodyElement) {
  // All objects of the welcome window are stored here to provide access to
  const welcomeRoot = (function (className) {
    const root = document.createElement('div');
    root.classList.add(className);
    return root;
  })('welcome');

  let startingOption;
  const button = _initButton('welcome__button', 'Start');

  let optionsList = [
    { type: 'radio', name: 'option', value: 'Cross', id: 'cross' },
    { type: 'radio', name: 'option', value: 'Nought', id: 'nought' },
  ];

  const optionClass = 'welcome__option';
  const radioClass = 'welcome__radio';

  const options = _initRadio(optionsList, optionClass, radioClass);

  function _initRadio(optionList, optionClass, radioClass) {
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('board__options');
    optionList.forEach((option) => {
      const optionLabel = document.createElement('label');
      optionLabel.classList.add(optionClass);

      const optionInput = document.createElement('input');
      optionInput.classList.add(radioClass);

      // Set attributes for options
      for (property in option)
        optionInput.setAttribute(property, option[property]);

      optionLabel.appendChild(optionInput);
      optionLabel.innerHTML += option.value;

      optionDiv.appendChild(optionLabel);
    });
    return optionDiv;
  }

  function _initButton(className, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.disabled = true;
    button.classList.add(className);

    return button;
  }

  const buttonClickEventListener = function (handler) {
    button.addEventListener('click', (event) => handler());
  };

  // Enable the button upon clicking on either radio option
  welcomeRoot.addEventListener('click', (event) => {
    if (event.target.matches(`.${radioClass}`)) {
      button.disabled = false;
      startingOption = event.target.value;
    }
  });

  welcomeRoot.appendChild(options);
  welcomeRoot.appendChild(button);
  bodyElement.append(welcomeRoot);

  /** Close the welcome dialog form */
  const hide = () => bodyElement.removeChild(welcomeRoot);

  /** Show the welcome dialog form */
  const show = () => bodyElement.appendChild(welcomeRoot);

  const getStartingOption = () => {
    return startingOption;
  };

  return { hide, show, buttonClickEventListener, getStartingOption };
})(body);

/** Renders the game board.
 * @param {cellView} cellViews - an array of cellView objects to be rendered
 */
const boardView = function (cellViews, bodyElement) {
  const rootDiv = document.createElement('div');
  let boardTwoDimArray = [];

  const buttonRestart = _initRestartButton('button-restart');
  const board = _initBoard('board', cellViews);

  function _initBoard(boardClassName, cellViews) {
    const boardRoot = document.createElement('div');
    boardRoot.classList.add(boardClassName);

    // push cellViews to storage
    while (cellViews.length > 0) {
      let cellViewRow = [];
      const dim = 3;
      for (let i = 0; i < dim; i++) {
        cellViewRow = [...Array(dim).keys()].map(() => cellViews.pop());
        cellViewRow.forEach((cell) => boardRoot.appendChild(cell.render()));
        boardTwoDimArray.push(cellViewRow);
      }
    }

    return boardRoot;
  }

  // Initialize the restart button.
  function _initRestartButton(className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Start new game';
    button.classList.add(className);
    return button;
  }

  const addRestartHandler = (restartHandler) => {
    buttonRestart.addEventListener('click', (event) => restartHandler());
  };

  /** Attaches the rendered board to the root element */
  const show = function () {
    rootDiv.appendChild(board);
    rootDiv.appendChild(buttonRestart);
    bodyElement.appendChild(rootDiv);
  };

  const hide = function () {
    bodyElement.removeChild(rootDiv);
  };

  /** Replaces the current cell view with the one supplied in the cellView argument.
   * @param {Number} row - row number;
   * @param {Number} column - column number;
   * @param {cellView} cellView - the modified cell view.
   */
  const updateCell = function (value, row, column) {
    boardTwoDimArray[row][column].setValue(value);
  };

  return { show, hide, updateCell, addRestartHandler };
};

/** Models the game board */
const boardModel = function (cellModels) {
  /** A two-dimensional array of board cells of defined dimensions.
   * @param {Number} dimensions - denotes the array size
   */
  let moveCounter = 0;

  const dim = 3;
  const board = (function (cellModels) {
    let arr = [[], [], []];
    cellModels.forEach((cell, index) => arr[index % dim].push(cell));
    return arr;
  })(cellModels);

  /** Returns false if the winner hasn't been determined.
   *
   * Returns 'Cross' if the player whose mark is crosses has won.
   *
   * Returns 'Nought' if the player whose mark is zeroes has won.
   *
   * Returns 'Draw' if the total number of moves made is equal to 9 and
   * no player has achieved any of the win conditions.*/
  const ifPlayerWon = function () {
    moveCounter++;
    const winConditions = [
      [board[0][0], board[1][1], board[2][2]],
      [board[2][0], board[1][1], board[0][2]],
      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],
      [board[0][0], board[0][1], board[0][2]],
      [board[1][0], board[1][1], board[1][2]],
      [board[2][0], board[2][1], board[2][2]],
    ].map((condition) => condition.map((value) => value.getCell()));

    for (condition of winConditions) {
      if (condition.join('') === 'xxx') return 'Cross';
      else if (condition.join('') === '000') return 'Nought';
    }
    return moveCounter === 9 ? 'Draw' : false;
  };

  return {
    ifPlayerWon,
  };
};

/** Player prototype object. */
const playerProto = {
  /** Returns player mark. */
  getMark: function () {
    return this.mark;
  },

  /** Increments player score upon winning a round. */
  increaseScore: function () {
    return this.score++;
  },

  getScore: function () {
    return this.score;
  },
};
/** Models the player. */
const playerModel = function (mark, playerProto) {
  let playerData = { score: 0, mark: mark };
  let model = Object.assign(playerData, playerProto);
  return model;
};

const playerView = function (mark) {
  const root = document.createElement('div');
  root.classList.add('player');
};

const playerController = (function (playerModel, playerView, playerPrototype) {
  const markMapping = { Nought: '0', Cross: 'X' };

  let firstPlayer;
  let secondPlayer;

  let nowPlaying;

  const setupPlayers = function (firstPlayerMark) {
    firstPlayer = playerModel(markMapping[firstPlayerMark], playerPrototype);
    nowPlaying = firstPlayer;

    console.table(firstPlayer);

    const remainingMark = firstPlayerMark === 'Cross' ? 'Nought' : 'Cross';
    secondPlayer = playerModel(markMapping[remainingMark], playerPrototype);
  };

  /** Switches the player to make the next move. */
  const _nextMove = function () {
    if (nowPlaying === firstPlayer) {
      nowPlaying = secondPlayer;
    } else {
      nowPlaying = firstPlayer;
    }
  };

  const getNextMark = function () {
    _nextMove();
    return nowPlaying.getMark();
  };

  return { setupPlayers, getNextMark };
})(playerModel, playerView, playerProto);

const gameController = (function (
  boardView,
  boardModel,
  cellController,
  playerController,
  notificationControllerFactory,
  root,
) {
  let _cells;
  let _model;
  let _view;

  /** Initializes the cell values with empty strings.
   * Attaches a notification controller notifying the game controller
   * whenever a player performs a move.*/
  const _setupCells = function () {
    const _dim = 3;
    const notificationController =
      notificationControllerFactory(gameController);

    _cells = [...Array(_dim * _dim).keys()].map(() => {
      return cellController(notificationController);
    });

    // An one-dimensional array of views
    let cellViews = _cells.map((cell) => cell['cellView']);

    // An one-dimensional array of models
    let cellModels = _cells.map((cell) => cell['cellModel']);

    _model = boardModel(cellModels);
    _view = boardView(cellViews, root);
    _view.addRestartHandler(_restartHandler);
  };

  const onEvent = function (event) {
    const playerWon = hasPlayerWon();
    if (playerWon === false) {
      const nextMark = playerController.getNextMark();
      console.log(`Next mark: ${nextMark}`);
      if (event === 'move') {
        // When a move has been completed by a player,
        // assign the next player to make a move.
        for (cell of _cells) cell.updateNextValue(nextMark);
      }
    } else {
      console.log(`Outcome: "${playerWon}" has won`);
    }
  };

  /** Checks if either player has reached any of the win conditions. */
  const hasPlayerWon = function () {
    return _model.ifPlayerWon();
  };

  /** Reinitialize the gameboard whenever the restart button is pressed by the player. */
  function _restartHandler() {
    hide();
    _view = null;
    _model = null;
    show();
  }

  /** Displays the game board. */
  const show = function () {
    _setupCells();
    const nextMark = playerController.getNextMark();
    for (cell of _cells) {
      cell.updateNextValue(nextMark);
    }
    _view.show();
  };

  /** Hides the game board. */
  const hide = function () {
    _view.hide();
  };

  return { show, onEvent };
})(
  boardView,
  boardModel,
  cellController,
  playerController,
  notificationControllerFactory,
  body,
);

/** Notifies the game controller about an event from some object (say, a cell) */
function notificationControllerFactory(observer) {
  /** Notify the game controller about an event.
   * @param {cellController} obj;
   * @param {String} event.
   */
  const notify = function (event) {
    observer.onEvent(event);
  };

  return { notify };
}

/** The top-level controller responsible for the control flow
 * of both the welcome window and the game itself. */
const App = (function (welcomeDialog, gameController, playerController) {
  const startGame = function () {
    gameController.show();
  };

  /** Handles clicking on the 'Start' button after the option has been chosen. */
  const gameStartEventHandler = function () {
    welcomeDialog.hide();

    const firstPlayerMark = welcomeDialog.getStartingOption();
    playerController.setupPlayers(firstPlayerMark);
    startGame();
  };

  /** Binds the event listener to controller handler */
  welcomeDialog.buttonClickEventListener(gameStartEventHandler);

  /** Starts the app. */
  const start = () => welcomeDialog.show();

  return { start };
})(welcomeDialog, gameController, playerController);

App.start();
