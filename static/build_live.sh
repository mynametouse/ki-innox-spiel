#!/bin/sh
# Live-Build für apps.lab.reallabore.berlin/test01 (mit Google-Formular als Sammelstelle)
BSW_FORM="https://docs.google.com/forms/d/e/1FAIpQLSe2VZbIOQWuylbRwKF9vmNEaUkNFey3KbptNIWA0M3HTf3jzw/formResponse" \
BSW_FORM_ENTRY="entry.510740805" node "$(dirname "$0")/build.js"
