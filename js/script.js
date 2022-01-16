const body = document.querySelector('body');

cellModel = function () {
  let value = null;

  /** Returns the value of the cell.
   * @returns {Number} value - the value of the cell
   */
  const getCell = function () {
    return value;
  },

  /** Sets the value to valueToSet
   * @param {String} valueToSet - value to be assigned
   */
  const setCell = function (valueToSet) {
    if (value !== null) value = valueToSet;
    else throw new CellAssignmentError('This cell has already been assigned to.');
  };

  return { getCell, setCell };
};

const cellView = function (value, className, height, width) {
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

const cellFactoryController = function (view, model, dimension) {
  let cells = []; 

  function initCellStorage() {
    for (let i = 0; i < dimension; i++)
    let arr = Array(dimension).keys();
    cells.push(arr);
  }
  initCellStorage();

  const newCell = function (height, width) {
    const cellModel = model();
    const cellView = view('', height, width);
    
    cells[height][width] = {cellView, cellModel}
    return { cellView, cellModel }
  };

  const setCell = function (value, height, width) {
    cells[height][width].cellModel.setCell(value);      
    cells[height][width].cellView.getCell()
  }

  const getCell = function (height, width) {
    return cells[height][width]; 
  }

  return { newCell };
}(cellView, cellModel)

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

/** Renders the game board. */
const gameBoardView = function (dimensions) {
  const rootDiv = document.createElement('div');
  
  const board = (function (dimensions, cellClassName) {
    const boardRoot = document.createElement('div');

    boardRoot.style.display = 'grid';
    boardRoot.style.gridTemplateColumns = `repeat(${dimensions}, 1fr)`;
    boardRoot.style.gridTemplateRows = `repeat(${dimensions}, 1fr)`;
    boardRoot.classList.add('board__grid');

    // display cells 
    for (let height = 0; height < dimensions; height++) {
      for (let width = 0; width < dimensions; width++) {
        const cell = cellController.
        boardRow.push(cell);
        boardRoot.append(cell);
      }
      boardCellsArray.push(boardRow);
    }

    return boardRoot;
  })(dimensions, 'board__cell');

  /** Attaches the rendered board to the root element */
  const show = function() {
    rootDiv.appendChild(board);
  }

  const get

  return { show, updateCell() };
};

const gameBoardController = (function (
  gameBoardViewController,
  gameBoardModelController,
  dimension
) {
  const model = gameModelController();
  const view = gameViewController();
  function start() {
    v
  }
})(gameBoardView);

/** The top-level controller responsible for the control flow of both the welcome wind and the game itself. */
const gameController = (function (welcomeDialogView, gameBoardView, dimension) {
  /** Displays the welcome screen */
  const gameState = {};
  const gameBoardDimensions = 3;

  /** Displays the welcome message */
  const welcome = function () {
    welcomeDialogView.show();
  };

  const startGame = function () {
    gameState['gameView'] = gameBoardController(dimensions);
    gameState['gameView'].show();
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
})(welcomeDialog, gameBoardView, 3);

gameController.start();
