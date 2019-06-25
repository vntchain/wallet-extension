browserify origin_inpage.js > ../public/extension/inpage.js
browserify -t brfs origin_contentscript.js > ../public/extension/contentscript.js
# browserify origin_lib.js > extension/lib.js
# browserify origin_ui.js > extension/ui.js
browserify origin_background.js > ../public/extension/background.js
