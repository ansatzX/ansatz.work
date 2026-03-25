#!/bin/bash
sed -i.bak 's/main.content {/main.content {\n    width: 100% !important;/g' src/site/styles/user/minimalist-theme.scss
