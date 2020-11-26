# README

* This project requires Hugo 0.78.2 which can be installed from [here](https://gohugo.io/getting-started/installing). **Careful** the extended version is needed for SCSS preprocessing.
* Download `yarn` and run `yarn install` to install all dependencies.
* Run `yarn build:prod:js` to precompile `assets/js/index.js`. Run `yarn build:dev:js` to include a source map and not minify the javascript.
* Run `yarn watch:js` to precompile `assets/js/index.js` and watch for changes.

### Start Server

A dev server can be started with `hugo --config config.toml,config_qrgenerator server`

### Build Site

You can build two different Webpages from this code. They are defined in their respective config files:

* QR-Generator `config_qrgenerator.toml`
* QR Upload Page `config_uploadpage.toml`
* Landing Page `config_landingpage.toml`

The sites can be built with the command `hugo --config config.toml,${site_config}`. The build files are placed in the `public/` folder.

### Getting the translations

To get the translations from POEditor, simply run `getTranslations.py` with Python. You will need to create a `secrets.py` file in your root folder which looks like this:

    api_token = 'YOUR_POEDITOR_API_KEY'
    project_id = 'YOUR_POEDITOR_PROJECT_ID'
