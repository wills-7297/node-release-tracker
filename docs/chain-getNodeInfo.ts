import superagent from "superagent";

/**
 * Ada - rosetta
 * https://explorer.cardano.org/rosetta/network/options
 */
 export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host,
        body: {
            "network_identifier": {
                "blockchain": "cardano",
                "network": config.network,
                "sub_network_identifier": {
                    "network": ""
                }
            }
        },
        json: true,
    };
    const res = await requestApi(req, false);
    return res;
}

/**
 * algo
 */
 export async function getNodeVersion(host: string, params?: any){
    const req = {
        url: host + `/versions`,
    };

    const res = await requestApi(req, true, {
        // accept: `application/json`,
        au_api_key: params.au_api_key,
    });

    return res;
}

/**
 * atom
 * curl https://api.cosmos.network/node_info
 */
 export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host + '/node_info',
    };
    const res = await requestApi(req, false);
    return res.application_version.version;
}

// bnb
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/status"
    };
    const response = await requestApi(req, true);
    return response.result.node_info.version;
}

// dot/ksm/glmr/movr/aca/kma 从sidecar获取节点版本
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/node/version"
    };
    const result = await requestApi(req, true);
    return result.clientVersion;
}

// icp
export async function getNodeVersion(host: string, params?: any){
    const req: IReqParams = {
        url: host + `/network/options`,
        body: {
            "network_identifier": {
                blockchain: "Internet Computer",
                network: "00000000000000020101"
            },
        },
    }
    const res: any = await requestApi(req);
    return res;
}

// icx
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/admin/system"
    };
    const response = await requestApi(req, true);
    return response.buildVersion;
}

// luna
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/node_info"
    };
    const response = await requestApi(req, true);
    return response.application_version.version;
}

// nem
export async function getNodeVersion(host: string){
    // curl http://hugealice.nem.ninja:7890/node/info
    const req: IReqParams = {
        url: host+"/node/info"
    };
    const response = await requestApi(req, true);
    return response.metaData.version;
}

// trx
export async function getNodeVersion(host: string, params?: any){
    const req = {
        url: host + `/wallet/getnodeinfo`,
    };

    const res = await requestApi(req);

    return res;
}

// utxo： Btc ltc xec bch dash dgb dcr qtum ZEC Zen Doge
export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host,
        body: {
            jsonrpc: "2.0",
            method: "getnetworkinfo",
            id: Date.now().toString(),
            params: [],
        },
        json: true,
    };
    const res = await requestApi(req, false);
    return res;
}


/**
 * waves
 * curl https://nodes-testnet.wavesnodes.com/node/version
 */
 export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host + '/node/version',
    };
    const res = await requestApi(req, false);
    return res;
}

// xavax
export async function getNodeVersion(host: string, params?: any){
    const req: IReqParams = {
        url: host + "/ext/info",
        body: {
            jsonrpc: "2.0",
            id: 1,
            method: "info.getNodeVersion",
        },
        json: true,
    }
    const res: any = await requestApi(req);
    return res;
}

// xtz
export async function getNodeVersion(host: string, params?: any){
    const req = {
        url: host + `/version`,
    };

    const res = await requestApi(req, true);

    return res;
}


// 3.31 增加
// fil
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/version"
    };
    const response = await requestApi(req, true);
    return response.Version;
}

// sol
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/getVersion"
    };
    const result = await requestApi(req, true);
    return result["solana-core"];
}

// pokt
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/v1"
    };
    const result = await requestApi(req, true);
    return result;
}

// xrp
// curl -H 'Content-Type: application/json' -d '{"method":"server_info","params":[{}]}' https://s1.ripple.com:51234/
// https://xrpl.org/websocket-api-tool.html#server_info
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/",
        body: {"method":"server_info","params":[{}]}
    };
    const result = await requestApi(req, true);
    return result.info.build_version;
}

// kda
export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host + '/chainweb/0.0/mainnet01/cut/peer',
    };
    return await requestApi(req, false);
}

// rose
export async function getNodeVersion(config: IChainConf) {
    const network_identifier: any = {
        blockchain: 'Oasis',
        network: config.network || '53852332637bacb61b91b6411ab4095168ba02a50be4c3f82448438826f23898',
    };
    const req = {
        url: config.host + '/network/status',
        body: {
            "network_identifier": network_identifier
        },
        json: true,
    };
    return await requestApi(req, false);
}

// sc
export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host + '/daemon/version',
        headers: {
            "User-Agent": "Sia-Agent"
        }
    };
    const result: any = JSON.parse(await requestApi(req, true));
    return result.version
}

// scrt
export async function getNodeVersion(config: IChainConf) {
    const req = {
        url: config.host + '/node_info',
    };
    const res = await requestApi(req, false);
    // @ts-ignore
    return res.node_info.version
}

// stx
export async function getNodeVersion(config: IChainConf) {
    const nodeReq = {
        url: config.host + '/v2/info',
    };
    let nodeInfo = await requestApi(nodeReq, true);
    // @ts-ignore
    const nodeVersion = nodeInfo.server_version
    const apiReq = {
        url: config.host + '/extended/v1/status',
    };
    const apiInfo = await requestApi(apiReq, true);
    // @ts-ignore
    const apiVersion = apiInfo.server_version
    const version = {
        "node_version": nodeVersion,
        "api_version": apiVersion,
    }
    return JSON.stringify(version)
}

// xym
export async function getNodeVersion(host: string){
    const req: IReqParams = {
        url: host+"/node/info"
    };
    const response = await requestApi(req);
    return formatted(response.version);
}

function formatted(nodeVersion) {
    const placeholderHex = '00000000';
    const hexNodeVersion = (placeholderHex + nodeVersion.toString(16)).slice(-8);
    return hexNodeVersion
        .match(/.{1,2}/g)!
        .map((hex) => parseInt(hex, 16))
        .join('.');
}



export function requestApi(params, get?, config?, put?) {
    let requestSet = function (request) {
        if (config === undefined) {
            request
                .set("accept", "application/json")
                .set("Content-Type", "application/json")
        } else {
            if (config.accept) {
                request.set("accept", config.accept);
            }
            if (config.content_type) {
                request.set("Content-Type", config.content_type);
            }
            if (config.auth) {
                request.set("Authorization", config.auth);
            }
            if (config.au_api_key) {
                request.set("X-API-Key", config.au_api_key);
            }
            if (config.x_client_name) {
                request.set("X-Client-Name", config.x_client_name);
            }
            if (config.x_client_version) {
                request.set("X-Client-Version", config.x_client_version);
            }
        }
        request.timeout(20000);

        return request;
    }

    if (!get && !put) {
        return new Promise((resolve, reject) => {
            requestSet(superagent
                .post(params.url)
                .send(params.body) // sends a JSON post body)
            ).end((err, res) => {
                if (err) {
                    return reject(err);
                }
                return resolve(res.body);
            });
        });
    } else if (put) {
        return new Promise((resolve, reject) => {
            superagent
                .put(params.url)
                .send(params.body)
                .end((err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res.body);
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            superagent
                .get(params.url)
                .end((err, res) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(res.body);
                });
        });
    }
}
export interface IChainConf {
    host: string;
    au_api_key?: string;
    dfuse_api_host?: string;
    username?: string;
    password?: string;
    port?: number;
    network?: string;
}

export interface IReqParams {
    url: string;
    body?: object | string;
    headers?: object;
    contentType?: any;
    accept?: any;
    json?: boolean;
    get?: boolean;
}