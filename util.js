function salter(len) {
    return Math.floor(Math.random()*Math.PI*1e16).toString(16).substring(0,(len<=16&&len>0&&typeof len==="number")?len:16);
}

module.exports = {salter};