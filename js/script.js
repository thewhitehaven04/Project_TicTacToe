const body = document.querySelector('body');

cellModel = function () {
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
    if (value !== null) {
      value = valueToSet;
    } else throw new CellAssignmentError('This cell has already been assigned to.');
  };

  return { getCell, setCell };
};

const cellView = function (value, className) {
  const element = document.createElement('div');

  function render() {
    element.classList.add(className);
    element.textContent = value;

    return element;
  }

  function setCell(value) {
    element.textContent = value;
  }

  return { render, setCell };
};

const cellFactoryController = (function (view, model) {
  /** Returns an object containing the cell's view and model. */
  const newCell = function () {
    const cellModel = model();
    const cellView = view('', 'board__cell');
    return { cellView, cellModel };
  };

  return { newCell };
})(cellView, cellModel);

const welcomeDialog = (function (bodyElement) {
  // All objects of the welcome window are stored here to provide access to
  const welcomeRoot = (function (className) {
    const root = document.createElement('div');
    root.classList.add(className);
    return root;
  })('welcome');

  let optionsList = [
    { type: 'radio', name: 'option', value: 'Cross', id: 'cross' },
    { type: 'radio', name: 'option', value: 'Nought', id: 'nought' },
  ];

  const optionClass = 'welcome__option';
  const options = (function (optionList, optionClass) {
    const optionDiv = document.createElement('div');
    optionList.forEach(option => {
      const optionInput = document.createElement('input');
      optionInput.classList.add(optionClass);

      // Set attributes for options
      for (property in option) optionInput.setAttribute(property, option[property]);

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
    button.addEventListener('click', event => {
      handler();
    });
  };

  // Enable the button upon clicking on either radio option
  welcomeRoot.addEventListener('click', event => {
    if (event.target.matches(`.${optionClass}`)) {
      button.disabled = false;
    }
  });

  welcomeRoot.appendChild(options);
  welcomeRoot.appendChild(button);
  bodyElement.append(welcomeRoot);

  /** Close the form */
  const hide = function () {
    bodyElement.removeChild(welcomeRoot);
  };

  /** Show the form */
  const show = function () {
    bodyElement.appendChild(welcomeRoot);
  };

  return { hide, show, buttonClickEventListener };
})(body);

/** Renders the game board.
 * @param {Number} dimensions - board dimensions;
 * @param {cellView} cellViews - an array of cellView objects to be rendered
 */
const gameBoardView = function (dimensions, cellViews, bodyElement) {
  const rootDiv = document.createElement('div');
  let boardTwoDimArray = [];

  const board = (function (dimensions, cellClassName, cellViews) {
    const boardRoot = document.createElement('div');
    boardRoot.style.display = 'grid';
    boardRoot.style.gridTemplateColumns = `repeat(${dimensions}, 1fr)`;
    boardRoot.style.gridTemplateRows = `repeat(${dimensions}, 1fr)`;
    boardRoot.classList.add(cellClassName);

    // push cellViews to storage
    while (cellViews.length > 0) {
      let cellViewRow = [];
      for (let i = 0; i < dimensions; i++) {
        cellViewRow = [...Array(dimensions).keys()].map(() => cellViews.pop());
        cellViewRow.forEach(cell => boardRoot.appendChild(cell.render()));
        boardTwoDimArray.push(cellViewRow);
      }
    }

    return boardRoot;
  })(dimensions, 'board', cellViews);

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
const gameBoardModel = function (cellModels) {
  /** A two-dimensional array of board cells of defined dimensions. */
  const board = (function (dimensions) {
    let arr = [];
    for (let row = 0; row < dimensions; row++) {
      let row = [];
      for (let column = 0; column < dimensions; column++)
        row.push(cellModels[row][column]);
      arr.push(row);
    }
    return arr;
  })(cellModels);

  const updateCell = function (value, row, column) {
    board[row][column].setCell(value);
  };

  const getCell = (row, column) => {
    return board[row][column];
  };

  return { getCell, updateCell, getCell };
};

const gameBoardController = (function (
  gameBoardView,
  gameBoardModel,
  cellFactoryController,
  dimension,
  root
) {
  const cells = (function (dimension) {
    const dim = dimension * dimension;
    const cellArr = [...Array(dim).keys()].map(() => cellFactoryController.newCell());
    return cellArr;
  })(dimension);

  let cellViews = cells.map(cell => cell['cellView']);
  let cellModels = cells.map(cell => cell['cellModel']);

  const model = gameBoardModel(cellModels);
  const view = gameBoardView(dimension, cellViews, root);

  const updateCell = function (value, row, column) {
    model.updateCell(value, row, column);
    view.updateCell(value, row, column);
  };

  const show = () => view.show();

  return { updateCell, show };
})(gameBoardView, gameBoardModel, cellFactoryController, 3, body);

/** The top-level controller responsible for the control flow
 * of both the welcome window and the game itself. */
const gameController = (function (welcomeDialogView, gameBoardController, dimension) {
  const gameState = {};

  /** Displays the welcome message */
  const welcome = function () {
    welcomeDialogView.show();
  };

  const startGame = function () {
    gameState['boardController'] = gameBoardController;
    gameState['boardController'].show();
  };

  /** Handles clicking on the 'Start' button after the option has been chosen. */
  const gameStartEventHandler = function () {
    welcomeDialogView.hide();
    startGame();
  };

  /** Binds the event listener to controller handler */
  welcomeDialogView.buttonClickEventListener(gameStartEventHandler);

  /** Starts the app. */
  const start = function () {
    welcome();
  };

  return { start };
})(welcomeDialog, gameBoardController, 3);

gameController.start();
