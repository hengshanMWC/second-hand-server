export let getTar = event => event.currentTarget.dataset
/**
 * 克隆一个全新对象，但不能对dom对象有限
 * */
export let newObj = obj => JSON.parse(JSON.stringify(obj))
/**
 * 要深度合并的对象，材料对象
 * 返回深度合并的对象
 * 即使是数组对象也可以深度合并
 * 合并优先级为前者大于后者
 */
export function depthAssign(obj, ...objs) {
  objs.forEach(val => {
    for (let attr in val) {
      if (obj[attr]) {
        if (typeof obj[attr] === 'object') {
          let oj = obj[attr]
          if (oj instanceof Array) {
            oj.forEach((element, i) => {
              if (typeof element === 'object') oj[i] = depthAssign(element, val[attr][i])
            })
          } else {
            oj = depthAssign(oj, val[attr])
          }
        }
      } else {
        obj[attr] = val[attr]
      }
    }
  })
  return obj;
}
/**
 * Date或者时间戳，Number/数组，String年月日格式
 */
export function formatTimea(date = new Date(), format = 0, slice) {
  slice = typeof data === 'string' ? data : '-' 
  const repair = num => num < 10 ? '0' + num : num;
  const aFn = [
    () => date.getFullYear(),
    () => repair(date.getMonth() + 1),
    () => repair(date.getDate()),
    () => repair(date.getHours()),
    () => repair(date.getMinutes()),
    () => repair(date.getSeconds()),
  ]
  const styles = [
    slice,
    slice,
    ' ',
    ':',
    ':',
    ''
  ]
  function oFn() {
    let str = ''; 
    Array.isArray(format) ?
      aFn.slice(format[0], format[1]).forEach((fn, i, arr) => str += arr.length - 1 > i ? fn() + styles[format[0] + i] : fn()) : 
      aFn.slice(format).forEach((fn, i) => str += (fn() + styles[i]))
    return str;
  }
  return oFn();
}
//判断是否http://或者https://的开发
export function isProtocol(str){
  let b = new RegExp('^http[s]?://')
  return b.test(str)
}
export function week(date = new Date(),str = '星期', b){
  let arr = ['一','二','三','四','五','六']
  let day = date.getDay()
  if(b) {
    arr[0] = '今天'
    arr[1] = '明天'
    return day > 1 ? str + arr[day] : arr[day]
  } else {
    return str + arr[day]
  }
}
