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
  return (gasPrice * gasLimit) / 1000000000
}
