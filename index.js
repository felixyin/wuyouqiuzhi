"use strict";

const puppeteer = require("puppeteer");
const fs = require("fs"); // 引入fs模块

function writeFile(content) {
  fs.writeFileSync(
    "./haisense-all.txt",
    content,
    { flag: "a" },
    function (err) {
      if (err) console.error(err);
    }
  );
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  const page = await browser.newPage();

  await page.goto("http://www.wuyouqiuzhi.com", {});

  //   点击去登陆按钮
  await page.waitForTimeout(2 * 1000);
  await page.evaluate("showuserlogin()");

  // 找到登陆iframe
  await page.waitForTimeout(2 * 1000);
  const frame = page.frames().find((frame) => frame.name() === "Openloginbox");

  //输入登陆账号
  await frame.type("#UserName", "fexliyin", { delay: 50 }); // 输入变慢，像一个用户
  await frame.type("#PassWord", "Ybkk1027", { delay: 50 }); // 输入变慢，像一个用户

  // 点击登陆
  await page.waitForTimeout(1 * 1000);
  frame.click("#Button1", { delay: 100 });
  //   await browser.close();

  // 登陆成功了
  // 跳转购买的产品页面
  await page.waitForTimeout(1 * 1000);
  await page.goto("http://www.wuyouqiuzhi.com/learn-3930.aspx");

  //点击模拟试题tab
  await page.waitForTimeout(1 * 1000);
  const tabs = await page.$$(".tab_name>li");
  const lastTab = tabs[tabs.length - 1];
  await lastTab.click();

  // 获取模拟试题列表
  const hrefs = await page.$$eval("#sjinfo1 .databtn", (links) => {
    return links.map((link) => {
      return link.getAttribute("href");
    });
  });
  console.log(hrefs);

  // 跳过前10个项目，都是职业性格和整体题目
  for (let i = 0; i < hrefs.length; i++) {
    let allTiMu = "";
    const href = hrefs[i];

    //   跳转考试页面
    await page.goto(href);
    await page.waitForTimeout(2 * 1000);
    const shiJuanName = await page.$eval(".title", (t) => t.innerText);

    // 只取一个
    const kaoLink = await page.$eval(".jrbtn", (btn) => {
      return btn.getAttribute("href");
    });

    // 提交空白试卷
    await page.waitForTimeout(1 * 1000);
    await page.goto(kaoLink);
    // await page.waitForNavigation();

    try {
      // 处理 “本试卷只能做2次问题”····
      await page.waitForSelector("#page-btn-submit", { timeout: 5000 });
      await page.waitForTimeout(1 * 1000);
      await page.click("#page-btn-submit");
      await page.waitForTimeout(1 * 1000);
      await page.click(".aui_state_highlight");
    } catch (e) {
      console.log("跳过试卷：" + shiJuanName);
      continue;
      //   await page.waitForTimeout(1 * 1000);
      //   await page.click(".aui_state_highlight");·
    }

    allTiMu +=
      "\n\n\n###################################################################################################################################################################################################################################################################";
    allTiMu += shiJuanName;
    allTiMu += "\n";

    // 获取题目类型按钮
    await page.waitForNavigation();
    await page.waitForTimeout(10 * 1000); // 等待打分结束

    // allTiMu += await page.evaluateHandle(() => {
    //   debugger;
    //   var btns = $("#page-rules>input").filter(function () {
    //     return $(this).hasClass("topInputOver") || $(this).hasClass("topInput");
    //   });
    //   var text = "";
    //   for (var i = 0; i < btns.length; i++) {
    //     var btn = btns[i];
    //     var v = btn.value;
    //     console.log(v);
    //     btn.click();
    //     btn.click();
    //     text += "\n--------------------------------------------------";
    //     text += v;
    //     text += "\n";
    //     var t = $("#content").text();
    //     console.log(t);
    //     text += t;
    //   }
    //   return text;
    // });
    // const leiXingBtns = await page.$$("#page-rules>input");

    // for (let i = 0; i < leiXingBtns.length; i++) {
    //   const leiXingBtn = leiXingBtns[i];
    //   const ps = await leiXingBtn.getProperties();
    //   // 跳过非可见按钮
    //   if (ps["class"] != "topInputOver" || ps["class"] != "topInput") continue;

    //   // 点击某一个类型的题目按钮
    //   await page.waitForTimeout(1 * 1000);
    //   leiXingBtn.click();
    //   const leiName = await leiXingBtn.getProperties()["value"];
    //   allTiMu += "\n--------------------------------------------------";
    //   allTiMu += leiName;
    //   allTiMu += "\n";

    //   // 获取题目和答案
    //   await page.waitForTimeout(1 * 1000);
    //   const daAn = await page.$eval("#content", (c) => c.innerText);
    //   allTiMu += daAn;
    // }

    const leiXingBtns = await page.$$("#page-rules>input");

    let daAn = ""; // 解决evalute方法无法sleep问题，因js单线程。所以重复数据过滤掉
    for (let i = 0; i < leiXingBtns.length; i++) {
      const leiXingBtn = leiXingBtns[i];

      // 点击某一个类型的题目按钮
      await page.waitForTimeout(1 * 1000);
      try {
        leiXingBtn.click();

        // 获取题目和答案
        await page.waitForTimeout(2 * 1000);
        const daAn2 = await page.$eval("#content", (c) => c.innerText);
        if (daAn != daAn2) {
          allTiMu += daAn2;
          daAn = daAn2;
        }
      } catch (e) {
        // 解决node节点不可见, 导致的不可点击问题
      }
    }

    console.log(allTiMu);
    writeFile(allTiMu);

    console.log("\n\n已经写入试卷答案, very good\n\n");
    await page.waitForTimeout(5 * 1000);
  }
}

main();
