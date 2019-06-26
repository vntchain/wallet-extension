if [ ! -d "extension" ]; then 
    mkdir "extension"
fi

browserify origin_inpage.js > extension/inpage.js
browserify -t brfs origin_contentscript.js >  extension/contentscript.js
# browserify origin_lib.js > extension/lib.js
# browserify origin_ui.js > extension/ui.js
browserify origin_background.js > extension/background.js

cp -rf extension/*  ../public/extension/