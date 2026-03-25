#!/bin/bash
awk '
/body\[class\*="theme-"\] nav.filetree-sidebar,/ {
    in_block = 1
}
/nav\.filetree-sidebar \{/ {
    print ".luxury-sidebar-left nav.filetree-sidebar {"
    in_left_nav = 1
    next
}
in_left_nav == 1 {
    if (/position: fixed !important;/) { next }
    if (/top: 2rem;/) { next }
    if (/left: 2rem;/) { next }
    if (/bottom: 2rem;/) { next }
    if (/max-height:/) { next }
    if (/}/) { in_left_nav = 0 }
    print
    next
}
/aside \{/ {
    print ".luxury-sidebar-right .sidebar {"
    in_right_nav = 1
    next
}
in_right_nav == 1 {
    if (/position: fixed !important;/) { next }
    if (/top: 2rem;/) { next }
    if (/right: 2rem;/) { next }
    if (/bottom: 2rem;/) { next }
    if (/max-height:/) { next }
    if (/}/) { in_right_nav = 0 }
    print
    next
}
/main\.content \{/ {
    print "main.content {"
    in_main = 1
    next
}
in_main == 1 {
    if (/margin-left:/) { next }
    if (/margin-right:/) { next }
    if (/padding: 6rem 2rem !important;/) { 
        print "    padding: 2rem !important;"
        next 
    }
    if (/}/) { in_main = 0 }
    print
    next
}
{ print }
' src/site/styles/user/minimalist-theme.scss > temp.scss
mv temp.scss src/site/styles/user/minimalist-theme.scss
