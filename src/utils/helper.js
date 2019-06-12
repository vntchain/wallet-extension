export const splitLongStr = str => {
  return str ? `${str.substr(0, 6)}...${str.substr(str.length - 6, 6)}` : ''
}

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

export const calCommission = (gasPrice, gasLimit) => {
  return (gasPrice * gasLimit) / Math.pow(10, 9)
}

export const calBigMulti = (num1, num2) => {
  console.log(num1,num2) //eslint-disable-line
  const numStr1 = num1.toString()
  const numStr2 = num2.toString()
  const numArr1 = numStr1.split('.')
  const numArr2 = numStr2.split('.')
  const floatLen1 = numArr1[1] ? numArr1[1].length : 0
  const floatLen2 = numArr2[1] ? numArr2[1].length : 0
  return (
    (Number(numStr1.replace('.', '')) * Number(numStr1.replace('.', ''))) /
    (floatLen1 * floatLen2)
  )
}
