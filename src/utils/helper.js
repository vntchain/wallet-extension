export const splitLongStr = str => {
  return str ? `${str.substr(0, 6)}...${str.substr(str.length - 6, 6)}` : ''
}

//读取文件
export const fileReaderAsText = fileBlod => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(fileBlod)
    reader.onload = function() {
      resolve(this.result)
    }
    reader.onerror = function(res) {
      reject(res)
    }
  })
}

//计算手续费
export const calCommission = (gasPrice, gasLimit) => {
  return (gasPrice * gasLimit) / Math.pow(10, 9)
}

//大数相乘
export const calBigMulti = (num1, num2) => {
  const numStr1 = num1.toString()
  const numStr2 = num2.toString()
  const numArr1 = numStr1.split('.')
  const numArr2 = numStr2.split('.')
  const floatLen1 = numArr1[1] ? numArr1[1].length : 0
  const floatLen2 = numArr2[1] ? numArr2[1].length : 0
  return (
    (num1 * Math.pow(10, floatLen1) * (num2 * Math.pow(10, floatLen2))) /
    Math.pow(10, floatLen1 + floatLen2)
  ).toFixed(2)
}

export const isEmptyObject = obj => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
