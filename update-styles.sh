#!/bin/bash

# Modify minimalist-theme.scss
# Add grid layout 
sed -i.bak -e '/\/\* ========================================================================/i \
/* ========================================================================\
   1.5. LUXURY APP SHELL (Grid Architecture)\
   ======================================================================== */\
.luxury-app-layout {\
    display: grid;\
    grid-template-columns: auto minmax(0, 1fr) auto;\
    grid-template-areas: "left main right";\
    gap: 2rem;\
    min-height: 100vh;\
    padding: 2rem;\
    box-sizing: border-box;\
    width: 100%;\
    max-width: 100vw;\
}\
\
.luxury-sidebar-left {\
    grid-area: left;\
    width: var(--sidebar-left-width);\
    display: flex;\
    flex-direction: column;\
}\
\
.luxury-content-core {\
    grid-area: main;\
    min-width: 0; /* Critical for grid minmax child to not overflow */\
    border-radius: 20px;\
    background: transparent !important;\
}\
\
.luxury-sidebar-right {\
    grid-area: right;\
    width: var(--sidebar-right-width);\
    display: flex;\
    flex-direction: column;\
}\
\
/* Responsive Behavior */\
@media (max-width: 1400px) {\
    .luxury-sidebar-left { display: none; }\
}\
\
@media (max-width: 1024px) {\
    .luxury-app-layout {\
        display: flex;\
        flex-direction: column;\
        padding: 1rem;\
    }\
    .luxury-sidebar-left, .luxury-sidebar-right { width: 100%; }\
}\
' src/site/styles/user/minimalist-theme.scss
