<img src="https://i.imgur.com/tZybQsU.gif"/>

# Pywalfox [<img src="https://img.shields.io/amo/v/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) [<img src="https://img.shields.io/amo/stars/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) [<img src="https://img.shields.io/amo/users/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) [<img src="https://img.shields.io/amo/dw/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)

> Dynamic theming of Firefox using your Pywal colors

- Tired of Firefox not respecting your gorgeous Pywal colors like the rest of your system? 
- Looking to rack up some karma :arrow_up: on [/r/unixporn](reddit.com/r/unixporn)? 

Introducing **Pywalfox**, an [add-on for Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) that themes the browser using your :clap: Pywal colors :clap: through the official Firefox Theme API! 
With Pywalfox you can:
- Customize the colors of almost every UI element
- Automatically theme DuckDuckGo :duck: (optional)
- Have bold text, styled dropdowns and much more (optional)
- Easily update the browser theme using the add-on and/or your terminal

# Requirements
- Python (both 2.7.x and 3.x versions are supported)
- Pywal
- Firefox
- Linux

# Installation

First, install the [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/).

**To use the add-on you must also install the script that fetches the Pywal colors:**
1. `git clone https://github.com/Frewacom/Pywalfox.git`
2. `cd Pywalfox`
3. `bash setup.sh`

   If the setup was successful, it should look something like this:
    ```
   Creating 'native-messaging-hosts' folder in ~/.mozilla
   Copying native messaging manifest to /home/<username>/.mozilla/native-messaging-hosts/pywalfox.json
   Setting path to daemon/pywalfox.py in the manifest
   Setting execution permissions on daemon/pywalfox.py
   Finished.
   ```

4. Restart Firefox 
5. Click the Pywalfox icon to access the settings and click "fetch Pywal colors" 

*If the Pywal colors could not be fetched, take a look in the Troubleshooting section below.*

# Usage

## Usage

## General usage here
Not done

## Further theming with the included userChrome.css and userContent.css
Pywalfox includes custom CSS sheets that you can enable. 
The custom CSS sheets applies your Pywal colors to the context menus and other elements of the browser that are not available using the Firefox Theme API.
The scrollbar can also be hidden for a cleaner look.

To enable the custom CSS sheets:
1. Navigate to `about:config` in Firefox
2. Set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`
3. To enable further theming of context menus etc., enable the "Use included userChrome.css" option under General settings in the Pywalfox settings page

   To hide the scrollbar, enable the "Use included userContent.css" option.

## Updating the theme using the terminal
If you are using some script for theming your system and do not want to manually refetch your Pywal colors using the Pywalfox settings page, you can trigger an update of the browser theme by running `./daemon/pywalfox.py update` in your terminal. 

# Troubleshooting
* If you updated Pywalfox and have issues, try re-running the setup script as described in Installation above.
* If you do not have permission to copy files to `.mozilla/native-messaging-hosts`, you can either

  - `chown <username> ~/.mozilla/native-messaging-host` 
  
     or  
     
  - `rm -r .mozilla/native-messaging-hosts`; the setup script will then recreate it with the correct permissions.
  
* Take a look at the Debugging output in the Pywalfox settings page
* Make sure that `path` in `~/.mozilla/native-messaging-hosts/pywalfox.json` points to the location of `daemon/pywalfox.py`
* Make sure that `pywalfox.py` is executable, i.e. `chmod +x pywalfox.py`
* Make sure that `~/.cache/wal/colors` exists and contains the colors generated by Pywal
* Take a look at the Browser console for errors, i.e. `Tools > Web developer > Browser console` in Firefox

## Errors in browser console
- `ExtensionError: No such native application pywalfox`:

   The manifest is not installed properly. Follow the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests.). The manifest is located at `daemon/assets/pywalfox-manifest.json`.

   If it is still not working try reinstalling Firefox, see [#14](https://github.com/Frewacom/Pywalfox/issues/14).

- `Unchecked lastError value: Error: Could not establish connection. Receiving end does not exist.`:

   The path to the script in the manifest is invalid or the script crashed on execution. Try running it manually.

   The script runs in an infinite loop, so as long as the script does not crash when running it, the issues must lie elsewhere.

If you encounter any other errors: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting

# Development setup
```bash
git clone git@github.com/Frewacom/Pywalfox.git
cd Pywalfox 
yarn install # or npm if you do not have yarn installed
yarn run debug
```

To build the extension into a zip: 
```bash
yarn run build
```
