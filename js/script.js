const body = document.querySelector('body');
const gameBoardDimensions = 3;

cellFactory = function () {
  let value = null;

  const cell = {
    /** Returns the value of the cell. */
    getCell: function () {
      return value;
    },
    /** Sets the value to valueToSet
     * @param {String} valueToSet - value to be assigned
     */
    setCell: function (valueToSet) {
      if (value !== null) {
        value = valueToSet;
      } else {
        throw new CellAssignmentError('This cell has already been assigned to.');
      }
    },
  };

  return cell;
};

const cellView = function (value) {
  function render() {
    const element = document.createElement('div');
    element.classList.add('cell');
    element.textContent = value;

    return element;
  }
  return { render };
};

const welcomeDialog = function (bodyElement) {
  /** Returns Element representing the dialog window. */

  const render = function () {
    const welcomeElement = document.createElement('div');
    welcomeElement.classList.add('welcome');

    const optionDiv = document.createElement('div');
    const optionClass = 'welcome__option';
    [
      { type: 'radio', name: 'option', value: 'Cross', id: 'cross' },
      { type: 'radio', name: 'option', value: 'Nought', id: 'nought' },
    ].forEach(option => {
      const optionInput = document.createElement('input');
      optionInput.classList.add(optionClass);

      // Set attributes
      for (property in option) optionInput.setAttribute(property, option[property]);

      optionDiv.appendChild(optionInput);

      const optionLabel = document.createElement('label');
      optionLabel.textContent = option.value;
      optionLabel.setAttribute('for', option.id);
      optionDiv.appendChild(optionLabel);
    });

    welcomeElement.appendChild(optionDiv);

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Start!';
    button.disabled = true;
    button.classList.add('welcome__button');

    button.addEventListener('click', event => {
      closeWelcomeEventHandler();
    });

    // Enable the button when the user clicks on either radiobutton
    welcomeElement.addEventListener('click', event => {
      if (event.target.matches(`.${optionClass}`)) {
        button.disabled = false;
      }
    });

    welcomeElement.appendChild(button);

    return welcomeElement;
  };

  const closeWelcomeEventHandler = () => {
    this.gameStartEventHandler();
  };

  /** Close the form */
  const hide = function () {
    bodyElement.removeChild(root);
  };

  /** Show the form */
  const show = function () {
    const welcomeElement = render();
    bodyElement.appendChild(welcomeElement);
  };

  return { hide, show };
};


const gameController = (function (welcomeDialog) {
  /** Displays the welcome screen */

  const bindDialogToController = function () {
    const welcomeDialogView = welcomeDialog.apply(gameController, [body]);        
    return welcomeDialogView;
  };

  const welcome = function () {
    welcomeDialogViewBound = bindDialogToController();
    welcomeDialogViewBound.show();
  };

  const gameStartEventHandler = function () {
    welcomeDialogViewBound = bindDialogToController();
    welcomeDialogViewBound.hide();
  };

  return { welcome, gameStartEventHandler };
})(welcomeDialog);

gameController.welcome();
