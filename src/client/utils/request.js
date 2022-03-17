const axios = require("axios").default;

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

const handleError = async (error) => {
    console.log(error)
    return error;
}

module.exports = {
    get: async (endpoint) => {
        const resp = await axios.get(
            `http://10.155.11.115:8300${endpoint}`,
            {
                // headers: constructHeader(headers)
            }
        );
        if(resp?.status !== 200 || resp?.data?.code !== 200) {
            handleError(resp);
        }else{
            return resp.data;
        }
    },
    post: async (endpoint, data) => {
        const resp = await axios.post(
            `http://10.155.11.115:8300${endpoint}`,
            data,
            {
                // headers: constructHeader(headers)
            }
        );
        if(resp?.status !== 200 || resp?.data?.code !== 200) {
            handleError(resp);
        }else{
            return resp.data;
        }
    }
};