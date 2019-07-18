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

const isEmpty = val => val === null || val === undefined || val === ''

//大数相乘
export const calBigMulti = (num1, num2) => {
  if (isEmpty(num1) || isEmpty(num2)) {
    return '--'
  }
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

//保留小数，但不四舍五入
export const formatDecimal = (num, decimal) => {
  if (isEmpty(num)) {
    return 0
  }
  num = num.toString()
  let index = num.indexOf('.')
  if (index !== -1) {
    num = num.substring(0, index + decimal + 1)
  } else {
    num = num.substring(0)
  }
  return parseFloat(num)
}

//delay
export const delay = function(time) {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve('success')
    }, time)
  )
}

//转字符串为16进制
export const fromAscii = function(str) {
  if (isEmpty(str)) return str
  str = str.toString()
  if (str.indexOf('0x') === 0) return str
  var hex = ''
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i)
    var n = code.toString(16)
    hex += n.length < 2 ? '0' + n : n
  }

  return '0x' + hex
}
