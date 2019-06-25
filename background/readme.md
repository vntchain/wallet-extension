### 如何修改以及生成新的background文件，用于插件的background

1. 将目录下的node_modules.zip解压到当前目录（会在当前目录下生成一个node_modules文件夹）
2. 将你需要修改的内容在origin_background.js、origin_inpage.js、origin_contentscript.js修改
3. 执行目录下的produce.sh脚本  
    如果提示`没有browserify`，则进行安装`npm install -g browserify`

4. 最后你只要按照wallet_extension下readme所说在wallet_extension下进行重新`npm run build`即可
