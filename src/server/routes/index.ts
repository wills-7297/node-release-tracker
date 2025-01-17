import * as db from "../services/db";
import * as requests from "../services/requests";
import concat from "concat-stream";
import axios from "axios";
import { LARK_ADMIN_URL, generateLarkNotice } from "../utils/lark";

module.exports = app => {
	app.get("/api/list/subscriptions", [
		listSubscriptions
	]);

	app.post("/api/add/feed", [
		addFeed
	]);
	
	app.post("/api/delete/feed", [
		deleteFeed
	]);
	
	app.post("/api/add/feed-proposal", [
		addFeedProposal
	]);
	
	app.post("/api/delete/feed-proposal", [
		deleteFeedProposal
	]);

	app.post("/api/update/feed", [
		updateCurrentFeed
	]);
	
	app.post("/api/update/node-versions", [
		updateOpNodeVersion
	]);

	app.post("/api/update/node-fullnames", [
		updateNodeFullName
	]);

	app.post("/api/confirm/no-update", [
		confirmNoUpdate
	]);

	app.post("/api/confirm/waiting", [
		confirmWaiting
	]);

	app.post("/api/update/handler", [
		updateHandler
	]);

	app.post("/api/table/add-column", [
		addColumn
	]);

	app.post("/api/set/reminder-date", [
		setReminderDate
	]);

	app.post("/api/update/info", [
		updateInfo
	]);
	
};


async function listSubscriptions(_, res: any){
	try{
		const subscriptions = await db.listSubscriptions();
		res.send({code:200, message:"success", data: subscriptions});
	}catch(error: any){
		res.send(error);
	}
};

async function addFeed(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { larkUrl, feedUrls } = JSON.parse(data.toString());
			try{
				for(let i=0; i<feedUrls.length; i++){
					const {feedUrl, nodeName, nodeFullName, handler} = feedUrls[i];
					// 若是非法地址，无法获取feed，抛错404
					await requests.getRssFeed(feedUrl);
					await db.subscribe(feedUrl, larkUrl, nodeName, nodeFullName, handler);
				}
				res.send({code:200, message:"success"});
			}catch(error: any){
				let code = error.code;
				let msg: string;
				switch(code){
					case "23505":
						msg = error.detail;
						break;
					default:
						msg = error;
				}
				if(error.message.includes("404")){
					code = "404";
					msg = "无法保存该订阅，请检查链接是否正确";
				}
				res.send({code, message: msg});
			}
		})
	);
};

async function deleteFeed(req: any, res: any){
	req.pipe(
		concat(async data => {
			let feedUrls = JSON.parse(data.toString());

			await db.unsubscribe(feedUrls);
			res.send({code:200, message:"success"});
		})
	);
};

async function addFeedProposal(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let parsed = JSON.parse(data.toString());
			const keys = Object.keys(parsed);
			let array: any[] = [];
			for(let i=0; i<keys.length; i++){
				array.push(`${keys[i]}: ${parsed[keys[i]]}`);
			}
			try{
				await axios.post(
					LARK_ADMIN_URL,
					generateLarkNotice("申请添加链节点", array),
				);

				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send({code: error.code, message: error});
			}
		})
	);
};

async function deleteFeedProposal(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let parsed = JSON.parse(data.toString());
			let array: any[] = [parsed.nodeFullName];
			try{
				await axios.post(
					LARK_ADMIN_URL,
					generateLarkNotice("申请删除链节点", array),
				);

				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send({code: error.code, message: error});
			}
		})
	);
};

async function updateCurrentFeed(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { feedUrl, updateFeed, githubNodeVersion } = JSON.parse(data.toString());
			try{
				// 更新status
				// 找到数据库中对应这次更新的运维节点的链列表
				const subscriptions: any = await db.filterSubscriptions("feed_url", `'${feedUrl}'`);
				const updateStatusQueue: any = [];
				subscriptions.forEach(oldOne=>{
					// 如果新的运维节点版本等于数据库中github节点版本，则修改状态为SAME，否则修改状态为UNCONFIRMED
					if(oldOne.op_node_version===githubNodeVersion){
						updateStatusQueue.push({feedUrl, status: "SAME"});
					}else{
						updateStatusQueue.push({feedUrl, status: "UNCONFIRMED"});
					}
				});
				await db.updateStatus(updateStatusQueue, "feed_url", "feedUrl");
				// 更新github最新feed及节点版本
				await db.updateCurrentFeed(feedUrl, updateFeed, githubNodeVersion);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send({code: error.code, message:  error});
			}
		})
	);
};

async function updateOpNodeVersion(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				// 更新status
				const updatesLength = updates.length-1;
				const criteria = updates.map((ele, index)=>{
					if(index===updatesLength){
						return `'${ele.nodeName}'`;
					}
					return `'${ele.nodeName}', `;
				})?.join("");
				// 找到数据库中对应这次更新的运维节点的链列表
				const subscriptions: any = await db.filterSubscriptions("node_name", criteria);
				const updateStatusQueue: any = [];
				subscriptions.forEach(oldOne=>{
					const newOne = updates.find(ele=>ele.nodeName===oldOne.node_name);
					// 如果新的运维节点版本等于数据库中github节点版本，则修改状态为SAME，否则修改状态为UNCONFIRMED
					if(newOne.nodeVersion===oldOne.github_node_version){
						updateStatusQueue.push({nodeName: newOne.nodeName, status: "SAME"});
					}else{
						updateStatusQueue.push({nodeName: newOne.nodeName, status: "UNCONFIRMED"});
					}
				});
				await db.updateStatus(updateStatusQueue, "node_name", "nodeName");

				// 更新运维节点版本
				await db.updateOpNodeVersion(updates);

				// 返回成功
				res.send({code:200, message:"success"});

			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function updateNodeFullName(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				await db.updateNodeFullName(updates);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function confirmNoUpdate(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { nodeName } = JSON.parse(data.toString());
			try{
				const updates: any = [{nodeName, status: "CONFIRMED"}];
				await db.updateStatus(updates, "node_name", "nodeName");
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function confirmWaiting(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let { nodeName } = JSON.parse(data.toString());
			try{
				const updates: any = [{nodeName, status: "WAITING"}];
				await db.updateStatus(updates, "node_name", "nodeName");
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function updateInfo(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let {updates, updateCol, byCol} = JSON.parse(data.toString());
			try{
				await db.updateInfo(updates, updateCol, byCol);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function updateHandler(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				await db.updateHandler(updates);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function addColumn(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let updates = JSON.parse(data.toString());
			try{
				for(let i=0; i<updates.length; i++){
					await db.addColumn(updates[i]?.columnName, updates[i]?.dataType);
				}
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};

async function setReminderDate(req: any, res: any){
	req.pipe(
		concat(async data => {
			if (data.length === 0) {
				return res.sendStatus(400);
			}
			let parsedData = JSON.parse(data.toString());
			try{
				await db.setReminderDate(parsedData);
				res.send({code:200, message:"success"});
			}catch(error: any){
				res.send(error);
			}
		})
	);
};
