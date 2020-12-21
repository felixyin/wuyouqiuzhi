# wuyouqiuzhi

http://www.wuyouqiuzhi.com 网站模拟试卷自动做题下载保存所有题目和答案题，支持爬取所有试卷。

index.js 实现了haisense 题库爬取，爬取不同试卷题库需：

- 可修改index.js 35行登陆自己的账号
- 可修改index.js 46行爬取其他题库

> 注意事项：因网站限制，每套测试试题只能做两次，所以此程序最多运行两次。可爬取所有模拟试卷题库
> 某些带有图片的题目还不能爬取，如需爬取请自己修改代码实现

## 环境

- nodejs

## 运行

```
# 先修改登陆账号，和对应题库列表url

cnpm i
node index.js

```
