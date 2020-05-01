/**
 * Implements an interface for the pywal colors fetched from the users computer by the native messaging host.
 *
 * @remarks
 * The colors that the native app sends out is just a list of colors, where
 * indexes 0-15 corresponds to the colors generated by pywal and 16-17 the
 * additional colors generated by the native app. All the colors are in the hex format.
 */
export interface IPywalColors  {
  [index: number]: string;
}

export interface IPalette {
  background: string;
  foreground: string;
  backgroundLight: string;
  accentPrimary: string;
  accentSecondary: string;
  text: string;
}

/**
 * Implements the interface for a browser theme.
 *
 * @remarks
 * The structure of this interface is based on the Firefox Theming API:
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/theme
 */
export interface IBrowserTheme {
  icons: string;
  icons_attention: string;
  frame: string;
  tab_text: string;
  tab_loading: string;
  tab_background_text: string;
  tab_selected: string;
  tab_line: string;
  tab_background_separator: string;
  toolbar: string;
  toolbar_field: string;
  toolbar_field_focus: string;
  toolbar_field_text: string;
  toolbar_field_text_focus: string;
  toolbar_field_border: string;
  toolbar_field_border_focus: string;
  toolbar_field_separator: string;
  toolbar_field_highlight: string;
  toolbar_field_highlight_text: string;
  toolbar_bottom_separator: string;
  toolbar_top_separator: string;
  toolbar_vertical_separator: string;
  ntp_background: string;
  ntp_text: string;
  popup: string;
  popup_border: string;
  popup_text: string;
  popup_highlight: string;
  popup_highlight_text: string;
  sidebar: string;
  sidebar_border: string;
  sidebar_text: string;
  sidebar_highlight: string;
  sidebar_highlight_text: string;
  bookmark_text: string;
  button_background_hover: string;
  button_background_active: string;
}

export interface IColorObject {
  id: string;
  value: string;
}

export type IExtensionTheme = string;
export type IDuckDuckGoTheme = IColorObject[];

export interface IColorscheme {
  palette: IPalette;
  browser: IBrowserTheme;
}

export interface IColorschemeTemplate {
  palette: {
    [key: string]: number;
  };
}

export interface IExtensionMessage {
  action: string;
  data?: any;
};

export enum ThemeModes {
  Dark = 'dark',
  Light = 'light',
  Auto = 'auto'
}

export interface IOptionSetData {
  option: string;
  enabled: boolean;
}

/* Interface for the messages received from the native messaging host. */
export interface INativeAppMessage {
  action: string;
  success: boolean;
  error?: string;
  data?: string;
  [key: string]: any;
}

export interface INativeAppMessageCallbacks {
  connected: () => void,
  updateNeeded: () => void,
  disconnected: () => void,
  version: (version: string) => void,
  output: (message: string) => void,
  colorscheme: (colorscheme: IPywalColors) => void,
  cssToggleSuccess: (target: string, enabled: boolean) => void,
  cssToggleFailed: (error: string) => void,
}

/**
 * Use an attribute of an element as key with the actual HTMLElement node.
 */
export interface INodeLookup {
  [key: string]: HTMLElement;
}

/**
 * Expose 'wrappedJSObject' from the 'window' namespace.
 *
 * @remarks
 * The object is used by the DuckDuckGo content script to interface
 * with the DuckDuckGo scripts. It allows us to get and set settings
 * using the built-in functions.
 */
declare global {
  interface Window {
    wrappedJSObject: { DDG: any; };
  }
}
