import * as Utils from './utils';
import * as Messenger from './messenger';

import { Dialog } from './dialog';
import { Colorpicker } from './colorpicker';
import { Themepicker } from './themepicker';

import {
  EXTENSION_MESSAGES,
  PYWAL_PALETTE_LENGTH,
  ENABLED_BODY_CLASS,
} from '../config/general';

import {
  THEME_TEMPLATE_DATA,
  PALETTE_TEMPLATE_DATA,
} from '../config/template-data';

import {
    IExtensionMessage,
    IColorschemeTemplate,
    IPaletteTemplate,
    IThemeTemplate,
    IInitialData,
    IOptionSetData,
    INodeLookup,
    IPywalColors,
    IThemeTemplateItem,
    IPaletteTemplateItem,
    IDebuggingInfoData,
} from '../definitions';

const optionButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-option]');
const helpToggleButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-help]');
const settingCardHeaders: NodeListOf<HTMLElement> = document.querySelectorAll('.setting-card-header');

const overlay: HTMLElement = document.getElementById('overlay');
const fetchButton: HTMLElement = document.getElementById('fetch');
const disableButton: HTMLElement = document.getElementById('disable');
const themeButton: HTMLElement = document.getElementById('theme-select');
const debuggingVersion: HTMLElement = document.getElementById('debugging-version');
const debuggingConnected: HTMLElement = document.getElementById('debugging-connected');
const debuggingOutput: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('debugging-output');

const paletteContent: HTMLElement = document.getElementById('palette-content');
const paletteTemplateContent: HTMLElement = document.getElementById('palette-template-content');
const paletteTemplateSaveButton: HTMLElement = document.getElementById('palette-template-save');
const paletteTemplateResetButton: HTMLElement = document.getElementById('palette-template-reset');
const paletteTemplateCurrentButton: HTMLElement = document.getElementById('palette-template-current');

const themeTemplateContent: HTMLElement = document.getElementById('theme-template-content');
const themeTemplateSaveButton: HTMLElement = document.getElementById('theme-template-save');
const themeTemplateResetButton: HTMLElement = document.getElementById('theme-template-reset');

const fontSizeSaveButton: HTMLElement = document.getElementById('font-size-save');
const fontSizeSaveInput: HTMLElement = document.getElementById('font-size-input');

const colorpicker = new Colorpicker();
const themepicker = new Themepicker();

let currentDialog: Dialog = null;
let pywalColors: IPywalColors = null;
let template: IColorschemeTemplate = null;

let optionButtonsLookup: INodeLookup = {};
let paletteTemplateInputLookup: INodeLookup = {};

/**
 * Opens a dialog on the right hand side of the UI.
 *
 * @param {IDialog} dialog - the dialog to open
 * @param {HTMLElement} target - the element that triggered the opening of the dialog
 */
function openDialog(dialog: Dialog, target: HTMLElement) {
  const overlayOpen = Utils.isOpen(overlay);

  if (!overlayOpen) {
    Utils.open(overlay);
  }

  if (currentDialog === dialog) {
    if (dialog !== colorpicker || currentDialog.getTarget() === target) {
      closeDialog();
      return;
    }
  } else if (currentDialog !== null && currentDialog !== dialog) {
    currentDialog.close();
  }

  dialog.open(target);
  currentDialog = dialog;
}

function closeDialog() {
  if (currentDialog !== null) {
    currentDialog.close();
    currentDialog = null;
  }

  if (Utils.isOpen(overlay)) {
    Utils.close(overlay);
  }
}

function setDebuggingInfo(info: IDebuggingInfoData) {
  debuggingConnected.innerText = info.connected ? 'Connected' : 'Disconnected';
  debuggingVersion.innerText = info.version == 0 ? 'version not set' : `version ${info.version}`;
}

function writeOutput(message: string) {
  debuggingOutput.value += message + '\n';
  debuggingOutput.scrollTop = debuggingOutput.scrollHeight; // Scrolls to bottom of textarea
}

function updatePaletteTemplateColorPreview(element: HTMLElement, index: number) {
  const previewElement = <HTMLElement>element.previousElementSibling;
  if (!previewElement) {
    console.error('Could not find preview element as sibling to:', element);
    return;
  }

  if (index < 0 || index >= PYWAL_PALETTE_LENGTH) {
    console.error(`Could not show color preview, index is invalid: ${index}`);
    return;
  }

  if (pywalColors !== null) {
    previewElement.style.backgroundColor = pywalColors[index];
  }
}

function onSettingCardClicked(header: HTMLElement) {
  Utils.toggleOpen(<HTMLElement>header.parentNode);
}

function onColorClicked(e: Event) {
  const element = <HTMLElement>e.target;
  openDialog(colorpicker, element);
  colorpicker.setSelectedColorForTarget(template.palette);
}

function setOptionEnabled(target: HTMLElement, enabled: boolean) {
  if (Utils.isSet('loading', target)) {
    Utils.loaded(target);
  }

  if (enabled) {
    Utils.select(target);
    Utils.select(target.parentElement);
    target.innerText = 'Yes';
  } else {
    Utils.deselect(target);
    Utils.deselect(target.parentElement);
    target.innerText = 'No';
  }
}

function onOptionClicked(e: Event) {
  const target = <HTMLElement>e.target;
  const option = target.getAttribute('data-option');
  const newState = Utils.isSet('selected', target) ? false : true;

  if (Utils.isSet('async', target)) {
    Utils.loading(target);
  }

  Messenger.requestOptionSet(option, newState);
}

function onOverlayClicked(e: Event) {
  closeDialog();
}

function onFetchClicked(e: Event) {
  Messenger.requestFetch();
}

function onDisableClicked(e: Event) {
  Messenger.requestDisable();
  pywalColors = null;
  colorpicker.setPalette(null);
  colorpicker.setSelectedColorForTarget(null);
  document.body.classList.remove(ENABLED_BODY_CLASS);
}

function onThemeClicked(e: Event) {
  openDialog(themepicker, themeButton);
}

function onFontSizeSave(e: Event) {
  const inputElement = <HTMLInputElement>fontSizeSaveInput;
  if (inputElement.checkValidity()) {
    // TODO: Set loading state on button
    Messenger.requestFontSizeSet(parseInt(inputElement.value));
  } else {
    // TODO: Display notification or something on error
    return;
  }
}

function onHelpToggle(target: HTMLElement) {
  const helpElementId: string = target.getAttribute('data-help');
  const helpElement = document.getElementById(helpElementId);

  if (!helpElement) {
    console.error(`Could not find help text with id: ${helpElementId}`);
    return;
  }

  Utils.toggleOpen(helpElement);
}

function onPaletteTemplateInputChanged(e: Event) {
  const target = <HTMLInputElement>e.target;
  const targetId = target.getAttribute('data-target');
  const value = target.value;

  if (!template.palette.hasOwnProperty(targetId)) {
    console.error(`Invalid/missing 'data-target' attribute on palette template input:  ${targetId}`);
    return;
  }

  if (target.checkValidity()) {
    const index = parseInt(value);
    template.palette[targetId] = index;
    updatePaletteTemplateColorPreview(target, index);
  }
}

function onPaletteTemplateSave(e: Event) {
  if (template === null || !template.hasOwnProperty('palette')) {
    console.error(`Template is null or the palette template is not set: ${template}`);
    return;
  }

  Messenger.requestPaletteTemplateSet(template.palette);
}

function onPaletteTemplateReset(e: Event) {
  Messenger.requestPaletteTemplateReset();
}

function onPaletteTemplateUseCurrent(e: Event) {

}

function onThemeTemplateSave(e: Event) {
  if (template === null || !template.hasOwnProperty('browser')) {
    console.error(`Template is null or the browser template is not set: ${template}`);
    return;
  }

  Messenger.requestThemeTemplateSet(template.browser);
}

function onThemeTemplateReset(e: Event) {
  Messenger.requestThemeTemplateReset();
}

function updateOptionButtonState(optionData: IOptionSetData) {
  const target: HTMLElement = optionButtonsLookup[optionData.option];

  if (target) {
    setOptionEnabled(target, optionData.enabled);
  }
}

function updatePaletteTemplateInputs(template: IPaletteTemplate) {
  for (const key in template) {
    const element = <HTMLInputElement>paletteTemplateInputLookup[key];
    if (element) {
      const index = template[key];
      element.value = index.toString();
      updatePaletteTemplateColorPreview(element, index);
    } else {
      console.error(`Found unhandled palette template target: ${key}`);
    }
  }
}

function createThemeTemplateContent() {
  THEME_TEMPLATE_DATA.forEach((item: IThemeTemplateItem) => {
    themeTemplateContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <button data-color="background" class="btn btn-color dialog-arrow"></button>
      </div>
    `;
  });
}

function createPaletteContent() {
  PALETTE_TEMPLATE_DATA.forEach((item: IPaletteTemplateItem) => {
    paletteContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <button data-color="${item.target}" class="btn btn-color dialog-arrow"></button>
      </div>
    `;

    paletteTemplateContent.innerHTML += `
      <div class="setting row expand space-between v-center">
        <div class="box column align-left">
          <p class="setting-title">${item.title}</p>
          <p class="setting-description">${item.description}</p>
        </div>
        <div class="box row v-center">
          <div class="btn btn-color color-preview margin-right-sm"></div>
          <input type="number" data-target="${item.target}" min="0" max="${PYWAL_PALETTE_LENGTH - 1}" />
        </div>
      </div>
    `;
  });

  const paletteTemplateInputs: NodeListOf<HTMLElement> = document.querySelectorAll('input[data-target]');
  const colorButtons: NodeListOf<HTMLElement> = document.querySelectorAll('button[data-color]');

  colorButtons.forEach((button: HTMLElement) => button.addEventListener('click', onColorClicked));
  paletteTemplateInputs.forEach((input: HTMLElement) => {
    const target = input.getAttribute('data-target');
    input.addEventListener('change', onPaletteTemplateInputChanged);
    paletteTemplateInputLookup[target] = input;
  });
}

async function setCurrentTheme(themeInfo?: browser.theme.ThemeUpdateInfo) {
  if (pywalColors === null) {
    const selectedMode = await Utils.setInitialThemeClass(themeInfo);
    themepicker.setSelectedMode(selectedMode);
  }
}

function setInitialData(data: IInitialData) {
  template = data.template;
  pywalColors = data.pywalColors;

  colorpicker.setPalette(data.pywalColors);
  colorpicker.setSelectedColorForTarget(data.template.palette);
  updatePaletteTemplateInputs(data.template.palette);

  if (data.enabled) {
    themepicker.setSelectedMode(data.themeMode);
    document.body.classList.add(ENABLED_BODY_CLASS);
  }

  for (const optionData of data.options) {
    updateOptionButtonState(optionData);
  }

  setDebuggingInfo(data.debuggingInfo);
}

function handleExtensionMessage(message: IExtensionMessage) {
  switch (message.action) {
    case EXTENSION_MESSAGES.INITIAL_DATA_SET:
      setInitialData(message.data);
      break;
    case EXTENSION_MESSAGES.PYWAL_COLORS_SET:
      pywalColors = message.data;
      colorpicker.setPalette(message.data);
      document.body.classList.add(ENABLED_BODY_CLASS);
      break;
    case EXTENSION_MESSAGES.TEMPLATE_SET:
      template = message.data;
      updatePaletteTemplateInputs(template.palette);
      colorpicker.setSelectedColorForTarget(template.palette);
      break;
    case EXTENSION_MESSAGES.PALETTE_TEMPLATE_SET:
      const paletteTemplate = message.data;
      colorpicker.setSelectedColorForTarget(paletteTemplate);
      updatePaletteTemplateInputs(paletteTemplate);
      template.palette = paletteTemplate;
      break;
    case EXTENSION_MESSAGES.THEME_TEMPLATE_SET:
      // TODO: Update theme template inputs
      break;
    case EXTENSION_MESSAGES.THEME_MODE_SET:
      themepicker.setSelectedMode(message.data);
      break;
    case EXTENSION_MESSAGES.OPTION_SET:
      updateOptionButtonState(message.data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_OUTPUT:
      writeOutput(message.data);
      break;
    case EXTENSION_MESSAGES.DEBUGGING_INFO_SET:
      setDebuggingInfo(message.data);
      break;
  }
}

function setupListeners() {
  overlay.addEventListener('click', onOverlayClicked);
  fetchButton.addEventListener('click', onFetchClicked);
  themeButton.addEventListener('click', onThemeClicked);
  disableButton.addEventListener('click', onDisableClicked);
  fontSizeSaveButton.addEventListener('click', onFontSizeSave);
  themeTemplateSaveButton.addEventListener('click', onThemeTemplateSave);
  themeTemplateResetButton.addEventListener('click', onThemeTemplateReset);
  paletteTemplateSaveButton.addEventListener('click', onPaletteTemplateSave);
  paletteTemplateResetButton.addEventListener('click', onPaletteTemplateReset);
  paletteTemplateCurrentButton.addEventListener('click', onPaletteTemplateUseCurrent);

  helpToggleButtons.forEach((button: HTMLElement) => button.addEventListener('click', () => onHelpToggle(button)));
  settingCardHeaders.forEach((header: HTMLElement) => header.addEventListener('click', () => onSettingCardClicked(header)));
  optionButtons.forEach((button: HTMLElement) => {
    const option = button.getAttribute('data-option');
    button.addEventListener('click', onOptionClicked);

    if (option) {
      optionButtonsLookup[option] = button;
    } else {
      console.warn('Found option button with no "data-option" attribute: ', button);
    }
  });

  browser.theme.onUpdated.addListener(setCurrentTheme);
  browser.runtime.onMessage.addListener(handleExtensionMessage);
}

setupListeners();
createPaletteContent();
createThemeTemplateContent();

setCurrentTheme();
Messenger.requestInitialData();
