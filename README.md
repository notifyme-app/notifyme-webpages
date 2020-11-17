# README 

* This project requires Hugo 0.78.2 which can be installed from [here](https://gohugo.io/getting-started/installing). **Carefull** the extended version is needed for SCSS preprocessing.
* Download `yarn` and run `yarn install` to install all dependencies.
* Run `yarn build:prod:js` to precompile `assets/js/index.js`. Run `yarn build:dev:js` to include a source map and not minify the javascript.
* Run `yarn watch:js` to precompile `assets/js/index.js` and watch for changes.

### Start Server

A dev server can be started with `hugo --config config.toml,config_qrgenerator server`

### Build Site

The site can be build with the command `hugo --config config.toml,config_qrgenerator`. The static files are placed in the `public/` folder.

### Getting the translations

To get the translations from POEditor, simply run `getTranslations.py` with Python. You will need to create a `secrets.py` file in your root folder which looks like this:

    api_token = 'YOUR_POEDITOR_API_KEY'
    project_id = 'YOUR_POEDITOR_PROJECT_ID'