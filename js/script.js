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

  const addMarkCellListener = (markHandler, value) => {
    element.addEventListener('click', (event) => markHandler(value));
  };

  const setCell = (value) => (element.textContent = value);

  return { render, setCell, addMarkCellListener };
};

/** Returns an object containing the cell's view and model. */
const cellController = function () {
  const view = cellView('', 'board__cell');
  const model = cellModel();

  /** Update the cell value both in the model and the view.
   * @param {Number} value - the value to be assigned to both the model and the view
   */
  const updateCell = function (value) {
    model.setCell(value);
    view.setCell(value);
  };

  view.addMarkCellListener(updateCell);

  return { updateCell, cellView: view, cellModel: model };
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
  const board = function (cellModels) {
    let arr = [[], [], []];
    cellModels.forEach((cell, index) => arr[index % dim].push(cell));
    console.table(arr);
    return arr;
  };

  const updateCell = (value, row, column) => board[row][column].setCell(value);

  const getCell = (row, column) => {
    return board[row][column];
  };

  return { getCell, updateCell };
};

const gameController = (function (
  boardView,
  boardModel,
  cellController,
  startingMark,
  root,
) {
  // dimensions of the board grid
  const _dim = 3;
  const _cells = [...Array(_dim * _dim).keys()].map(() => cellController());

  // Initializing the first player to make a move
  let nowPlaying = startingMark;

  // An one-dimensional array of views
  let cellViews = _cells.map((cell) => cell['cellView']);

  // An one-dimensional array of models
  let cellModels = _cells.map((cell) => cell['cellModel']);

  const model = boardModel(cellModels);
  const view = boardView(cellViews, root);

  const updateCell = function (value, row, column) {
    model.updateCell(value, row, column);
    view.updateCell(value, row, column);
  };

  const show = () => view.show();

  return { updateCell, show };
})(boardView, boardModel, cellController, body);

/** The top-level controller responsible for the control flow
 * of both the welcome window and the game itself. */
const App = (function (welcomeDialog, gameController) {
  const gameState = {};
  let nowPlaying;

  const startGame = function () {
    gameState['boardController'] = gameController();
    gameState['boardController'].show();
  };

  /** Handles clicking on the 'Start' button after the option has been chosen. */
  const gameStartEventHandler = function () {
    nowPlaying = welcomeDialog.getStartingOption();
    welcomeDialog.hide();
    startGame();
  };

  /** Binds the event listener to controller handler */
  welcomeDialog.buttonClickEventListener(gameStartEventHandler);

  /** Starts the app. */
  const start = () => welcomeDialog.show();

  return { start };
})(welcomeDialog, gameController, 3);

const playerController = function (firstPlayer, secondPlayer) {

};

App.start();
