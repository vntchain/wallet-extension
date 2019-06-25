## 加载扩展程序
安装依赖
```
npm install
```
或
```
yarn
```
编译项目
```
npm run build
```
或
```
yarn build
```
然后按以下操作步骤，加载扩展程序：
1. 在您的浏览器中访问 chrome://extensions（或者单击多功能框最右边的按钮：  The menu's icon is three horizontal bars.打开 Chrome 浏览器菜单，并选择工具(L)菜单下的扩展程序(E)，进入相同的页面）。

2. 确保右上角开发者模式复选框已选中。 Ensure that the Developer mode checkbox in the top right-hand corner is checked.

3. 单击加载正在开发的扩展程序…，弹出文件选择对话框。

4. 浏览至您的扩展程序文件所在的目录（build目录），并选定。

您也可以将扩展程序文件所在的目录拖放到浏览器中的 chrome://extensions 上加载它。

## 发布

打包为 .crx 文件，便于发布

## 主网测试网路由配置路径

/src/constants/net.js

## dapp与插件交互

见文档 “dapp与插件交互说明”
