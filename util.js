function salter(len) {
    return Math.floor(Math.random()*Math.PI*1e16).toString(16).substring(0,(len<=16&&len>0&&typeof len==="number")?len:16);
}
// the function below is 100% chatgpt
function getClientIP(req) {
    let ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        '127.0.0.1';

    // Normalize IPv6 localhost (::1) or 0.0.0.0 cases
    if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '0.0.0.0') {
        return '127.0.0.1';
    }

    return ip;
}
let banlist = [
    /terrorist/
]
const compiledBanlist = banlist.map(c => c instanceof RegExp ? c : new RegExp(c));

function handleUsername(username) {
    return compiledBanlist.some(r=>r.test(username));
}

module.exports = {salter, getClientIP, handleUsername};