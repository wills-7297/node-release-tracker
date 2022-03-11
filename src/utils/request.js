const axios = require("axios").default;
const port = process.env.PORT || 3000;

function constructHeader(headers) {
    if (!headers) {
        return {
            "Content-Type": "application/json"
        };
    }
    const { hmacSign, dateNow, appId, sign, timestamp, version, accessKey } = headers;
    return {
        "Content-Type": "application/json",
        "accept": "text/plain",
        "X-HMAC-ALGORITHM": "hmac-sha256",
        "X-HMAC-ACCESS-KEY": accessKey,
        "X-HMAC-SIGNED-HEADERS": "Date;app_id;sign;timestamp;version",
        "X-HMAC-SIGNATURE": hmacSign,
        "Date": dateNow,
        "app_id": appId,
        "sign": sign,
        "timestamp": timestamp,
        "version": version
    };
}

module.exports = {
    get: async (endpoint) => {
        const resp = await axios.get(
            `http://localhost:${port}${endpoint}`,
            {
                // headers: constructHeader(headers)
            }
        );
        return resp;
    },
    post: async (endpoint, data) => {
        const resp = await axios.post(
            `http://localhost:${port}${endpoint}`,
            data,
            {
                // headers: constructHeader(headers)
            }
        );
        return resp;
    }
};