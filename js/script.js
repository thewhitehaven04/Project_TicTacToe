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
   * nextValue is updated depending on which player is to make a move next.
   */
  const updateCell = function () {
    model.setCell(nextValue);
    view.setCell(nextValue);
    notifier.notify('move');
  };

  /** Update the value that is to be assigned to the cell in the next move.
   * @param {String} value - the value to be assigned.
   */
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

  let optionsList = [
    { type: 'radio', name: 'option', value: 'Cross', id: 'cross' },
    { type: 'radio', name: 'option', value: 'Nought', id: 'nought' },
  ];

  const optionClass = 'welcome__option';
  const options = (function (optionList, optionClass) {
    const optionDiv = document.createElement('div');
    optionList.forEach((option) => {
      const optionInput = document.createElement('input');
      optionInput.classList.add(optionClass);

      // Set attributes for options
      for (property in option)
        optionInput.setAttribute(property, option[property]);

      optionDiv.appendChild(optionInput);

      const optionLabel = document.createElement('label');
      optionLabel.textContent = option.value;
      optionLabel.setAttribute('for', option.id);

      optionDiv.appendChild(optionLabel);
    });
    return optionDiv;
  })(optionsList, optionClass);

  const button = (function (className, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.disabled = true;
    button.classList.add(className);

    return button;
  })('welcome_button', 'Start');

  const buttonClickEventListener = function (handler) {
    button.addEventListener('click', (event) => handler());
  };

  // Enable the button upon clicking on either radio option
  welcomeRoot.addEventListener('click', (event) => {
    if (event.target.matches(`.${optionClass}`)) {
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

  const board = (function (boardClassName, cellViews) {
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
  })('board', cellViews);

  /** Attaches the rendered board to the root element */
  const show = function () {
    rootDiv.appendChild(board);
    bodyElement.appendChild(rootDiv);
  };

  /** Replaces the current cell view with the one supplied in the cellView argument.
   * @param {Number} row - row number;
   * @param {Number} column - column number;
   * @param {cellView} cellView - the modified cell view.
   */
  const updateCell = function (value, row, column) {
    boardTwoDimArray[row][column].setValue(value);
  };

  return { show, updateCell };
};

/** Models the game board */
const boardModel = function (cellModels) {
  /** A two-dimensional array of board cells of defined dimensions.
   * @param {Number} dimensions - denotes the array size
   */
  const dim = 3;
  const board = (function (cellModels) {
    let arr = [[], [], []];
    cellModels.forEach((cell, index) => arr[index % dim].push(cell));
    return arr;
  })(cellModels);

  const updateCell = (value, row, column) => board[row][column].setCell(value);

  const getCell = (row, column) => {
    return board[row][column];
  };

  return { getCell, updateCell };
};

const playerModel = function (name, mark) {
  const getMark = function () {
    return mark;
  };

  const getName = function () {
    return name;
  };

  return { getMark, getName };
};

const playerController = (function (playerModel) {
  const markMapping = { Nought: '0', Cross: 'x' };

  let firstPlayer;
  let secondPlayer;

  let nowPlaying;

  const setupPlayers = function (firstPlayerMark) {
    firstPlayer = playerModel('First Player', markMapping[firstPlayerMark]);
    nowPlaying = firstPlayer;

    const remainingMark = firstPlayerMark === 'Cross' ? 'Nought' : 'Cross';
    secondPlayer = playerModel('Second Player', markMapping[remainingMark]);
  };

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
})(playerModel);

const gameController = (function (
  boardView,
  boardModel,
  cellController,
  playerController,
  notificationControllerFactory,
  root,
) {
  let _cells;
  let model;
  let view;

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

    model = boardModel(cellModels);
    view = boardView(cellViews, root);
  };

  const onEvent = function (event) {
    const nextMark = playerController.getNextMark();
    if (event === 'move') {
      for (cell of _cells) {
        cell.updateNextValue(nextMark);
      }
    }
  };

  const show = () => {
    _setupCells();
    const nextMark = playerController.getNextMark();
    for (cell of _cells) {
      cell.updateNextValue(nextMark);
    }
    view.show();
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
