import React, { useEffect } from "react";

function concatUint8Arrays(...arrays) {
  // 计算所有数组的总长度
  const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);

  // 创建新的 Uint8Array 来容纳所有数组
  const result = new Uint8Array(totalLength);

  // 逐个复制每个数组到 result 中
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }

  return result;
}

const array1 = new Uint8Array([1, 2, 3]);
const array2 = new Uint8Array([4, 5, 6]);
const array3 = new Uint8Array([7, 8, 9]);

const combinedArray = concatUint8Arrays(array1, array2, array3);

console.log(combinedArray); // 输出: Uint8Array(9) [1, 2, 3, 4, 5, 6, 7, 8, 9]
// 模拟逐字更新显示的方法
function updateDisplay(text) {
  // 找到一个用于显示内容的元素，例如 <div id="output"></div>
  const outputElement = document.getElementById("output");
  if (outputElement) {
    outputElement.textContent = text;
  }
}
const OPENROUTER_API_KEY =
  "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";
export function Chat() {
  useEffect(() => {
    const getData = async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          // "HTTP-Referer": `${YOUR_SITE_URL}`, // Optional, for including your app on openrouter.ai rankings.
          // "X-Title": `${YOUR_SITE_NAME}`, // Optional. Shows in rankings on openrouter.ai.
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo-1106",
          messages: [
            {
              role: "user",
              content: "说说中国今年的就业形式",
            },
          ],
        }),
      });
      console.log(res);

      if (!res.body) {
        console.error("No response body found!");
        return;
      }
    
      // 获取 ReadableStream 并通过 getReader 读取
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
    
      let partialText = ""; // 临时保存已经读取的文本
      // 逐步读取数据
      while (true) {
        // 从流中读取数据
        const { done, value } = await reader.read();

        // 如果读取完成，则退出循环
        if (done) {
          console.log("Stream complete");
          break;
        }

        // 将 Uint8Array 转换为字符串
        const chunk = decoder.decode(value, { stream: true });
        console.log(chunk)

        // 逐字显示新读取的部分
        for (let i = 0; i < chunk.length; i++) {
          partialText += chunk[i];
          // 在这里逐字更新到前端，例如在页面中的某个元素中显示
          updateDisplay(partialText);
        }
      }
    };
    getData();
    // res.then((result) => {
    //     console.log(result)
    // })
  }, []);
}
