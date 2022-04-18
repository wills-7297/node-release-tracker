const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('local_db');

const tableName = "local";

const statusMap = {
    "SAME": {value: "SAME", label: "一致", severity: "low"},
    "UNCONFIRMED": {value: "UNCONFIRMED", label: "未确认", severity: "high"},
    "CONFIRMED": {value: "CONFIRMED", label: "已确认 - 不需升级", severity: "low"},
    "WAITING": {value: "WAITING", label: "已确认 - 待处理", severity: "medium"},
};

/**
 * 数据库表结构：
 * feed_url: TEXT
 * lark_url: TEXT
 * node_name: TEXT
 * node_full_name: TEXT
 * current_feed: TEXT
 * github_node_version: TEXT, github节点版本
 * op_node_version: TEXT, 运维节点版本
 * status: TEXT, 参考statusMap
 * handler: TEXT
 */

async function db_run(query: string, params?: string[]){
    return new Promise(function(resolve,reject){
        db.run(query, params || [], function(err: Error){
            if(err){
                return reject(err);
            }
            resolve(null);
        });
    });
};

async function db_select(query: string, params?: string[]){
    return new Promise(function(resolve,reject){
        db.all(query, params || [], function(err: Error, res: any){
            if(err){
                return reject(err);
            }
            resolve(res);
        });
    });
};

export async function init(){
    // db.serialize(function() {});
    // db.run does not return any result
    await db_run(
        `CREATE TABLE IF NOT EXISTS ${tableName} (
            feed_url TEXT PRIMARY KEY,
            lark_url TEXT,
            node_name TEXT,
            node_full_name TEXT,
            current_feed TEXT,
            github_node_version TEXT,
            op_node_version TEXT,
            status TEXT,
            handler TEXT,
            reminder_date INTEGER,
            reminded INTEGER,
            reminder_text TEXT
        )`
    );
}

export async function listSubscriptions() {
    const rows = await db_select(
        `SELECT * FROM ${tableName}`
    );
    return rows;
};

export async function filterSubscriptions(column, criteria) {
    const rows = await db_select(
        `SELECT * FROM ${tableName} WHERE ${column} IN (${criteria})`
    );
    return rows;
};

export async function subscribe(feedUrl: string, larkUrl: string, nodeName: string, nodeFullName: string, handler: string) {
    if(!feedUrl || !larkUrl) throw Error("缺少入参");
    const res = await db_run(
        `INSERT INTO ${tableName}(feed_url, lark_url, node_name, node_full_name, handler) VALUES (?, ?, ?, ?, ?)`,
        [feedUrl, larkUrl, nodeName, nodeFullName, handler]
    );
    return res;
};

export async function unsubscribe(feedUrls: string[]) {
    var statement = db.prepare(
        `DELETE FROM ${tableName} WHERE feed_url=?`
    );

    for (var i = 0; i < feedUrls.length; i++) {
        statement.run(feedUrls[i]);
    }

    return;
};

export async function updateCurrentFeed(feedUrl: string, updateFeed: any, githubNodeVersion: string) {
    const res = await db_run(
        `UPDATE ${tableName} SET current_feed = ?, github_node_version = ?
        WHERE feed_url=?`,
        [JSON.stringify(updateFeed), githubNodeVersion, feedUrl]
    );
    return res;
};

export async function updateOpNodeVersion(array: any[]) {
    var statement = db.prepare(
        `UPDATE ${tableName} SET op_node_version = ?
        WHERE node_name=?`
    );

    for (var i = 0; i < array.length; i++) {
        const item = array[i];
        statement.run(item.nodeVersion, item.nodeName);
    }

    return;
};

export async function updateNodeFullName(array: any[]) {
    var statement = db.prepare(
        `UPDATE ${tableName} SET node_full_name = ?
        WHERE node_name=?`
    );

    for (var i = 0; i < array.length; i++) {
        const item = array[i];
        statement.run(item.nodeFullName, item.nodeName);
    }

    return;
};

export async function updateStatus(array: any[], column, criteria) {
    var statement = db.prepare(
        `UPDATE ${tableName} SET status = ?
        WHERE ${column}=?`
    );

    for (var i = 0; i < array.length; i++) {
        const item = array[i];
        const value = JSON.stringify(statusMap[item.status]);
        statement.run(value, item[`${criteria}`]);
    }

    return;
};

export async function updateHandler(array: any[]) {
    var statement = db.prepare(
        `UPDATE ${tableName} SET handler = ?
        WHERE node_name=?`
    );

    for (var i = 0; i < array.length; i++) {
        const item = array[i];
        statement.run(item.handler, item.nodeName);
    }

    return;
};

export async function setReminderDate(obj: any) {
    const res = await db_run(
        `UPDATE ${tableName} SET reminder_date = ?, reminded = ?, reminder_text = ?
        WHERE node_name=?`,
        [obj.reminderDate, obj.reminded, obj.reminderText, obj.nodeName]
    );

    return res;
};

export async function deleteTable(tableName: string) {
    const res = await db_run(
        `DROP TABLE IF EXISTS ${tableName}`
    );
    return res;
};

export async function addColumn(columnName: string, dataType: string) {
    const res = await db_run(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`
    );
    return res;
};

export async function dropColumn(columnName: string, newColumnName: string) {
    const res = await db_run(
        `ALTER TABLE ${tableName} RENAME COLUMN ${columnName} TO ${newColumnName}`
    );
    return res;
};
