#!/usr/bin/python

from translation import translation
import os
import sys

if len(sys.argv) > 2:
    api_token = sys.argv[1]
    project_id = sys.argv[2]
else:
    import secrets
    api_token = secrets.api_token
    project_id = secrets.project_id

if not os.path.exists("i18n"):
    os.makedirs("i18n")
    
languages = ['de', 'en', 'fr']

translation.loadLanguages(languages , project_id, "i18n", api_token)
