//  Node.js 编写的命令行工具，它的作用是生成指定目录的树状结构，并可以选择将结构输出到控制台或生成为 Markdown 文件

// 创建命令行、读取package.json内容，遍历目录，输出markdown
import fs from "fs";
import path from "path";
import { Command } from "commander";
import chalk from "chalk";

import packageJsonData from "../package.json" assert { type: "json" };
const { version } = packageJsonData;
const program = new Command();
const __dirname = path.resolve();

program
  .name("folder-print")
  .description("Using the CLI to generate the tree structure of the directory")
  .version(version,"-v, --version, -V");

program.option(
  "-d, --depth <type>",
  "Set the depth of the folder to be traversed",
  "10"
);
program.option("-p, --print", "Generate a markdown file");

program.parse(process.argv);

console.log(program.opts());
const depth = program.opts().depth;
const print = program.opts().print;

// 需要过滤的文件夹
const filterDir = [
  "node_modules",
  ".git",
  ".idea",
  "dist",
  "build",
  ".vscode",
  ".DS_Store",
];

// 项目名称
const folderName = `🌸 ${
  __dirname.split("/")[__dirname.split("/").length - 1]
} 🌸 \n`;
const colorFolderName = `🌸 ${chalk.greenBright(
  __dirname.split("/")[__dirname.split("/").length - 1]
)} 🌸\n`;
let content = folderName;
let colorContent = colorFolderName;

// 遍历文件夹，打印目录结构
export function printTree(dir = __dirname, spaceNum) {
  // 超出深度，不再遍历
  if (spaceNum > depth) {
    return;
  }
  // 读取文件夹
  const files = fs.readdirSync(dir).sort();
  // 按文件夹和首字母排序
  files.sort((a, b) => {
    const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
    const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
    if (aIsDir && !bIsDir) {
      return -1;
    } else if (!aIsDir && bIsDir) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  const length = files.length - 1;
  // 遍历文件夹
  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    // 过滤文件夹
    if (filterDir.includes(file)) {
      return;
    }
    if (stats.isFile()) {
      const str = `${generateSpace(spaceNum)}${generateLine(
        index,
        length
      )}${file}`;
      content += `${str}\n`;
      colorContent += `${str}\n`;
    } else if (stats.isDirectory()) {
      const str = `${generateSpace(spaceNum)}${generateLine(
        index,
        length
      )}${file}`;
      const colorStr = `${generateSpace(spaceNum)}${generateLine(
        index,
        length
      )}${chalk.hex("#4dc4ff").bold(file)}`;
      content += `${str}\n`;
      colorContent += `${colorStr}\n`;
      printTree(filePath, spaceNum + 1);
    }
  });
}
// 生成指定的连接符
function generateLine(index, length) {
  if (index === length) {
    return "└─ ";
  }
  return "├─ ";
}

// 生成指定的空格
function generateSpace(num) {
  let space = ``;
  for (let i = 0; i < num; i++) {
    // space += `   `;
    space += `│   `;
  }
  return space;
}

printTree(__dirname,0);
if(print){
  // console.log(content);
  content = `\`\`\`sh \n${content}\`\`\``;
  fs.writeFileSync("commond-tree.md", content, "utf8");
  console.log("✅ 已将目录结构生成到commond-tree.md 文件中");
}else{
    console.log(colorContent);
}

