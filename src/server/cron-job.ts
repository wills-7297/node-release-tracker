import axios from "axios";
import * as requests from "./services/requests";
import cron from "node-cron"
import { LARK_HARDFORK_URL, handlerToLarkId, generateLarkNotice } from "./utils/lark";

// running a task every: dev - 1 minute, prod - 15 minutes
const timeRange = process.env.NODE_ENV==="development" ? "1" : "15";
const port = process.env.PORT || 8000;

cron.schedule(`*/${timeRange} * * * *`, async () => {
    // 生产: 每隔10分钟循环从数据库中获取列表
    await main();
});

// 更新当前feed_url最新的current_feed
async function updateCurrentFeed(feed_url: string, updateFeed: any){
	const array = updateFeed?.link?.split("/");
	let githubNodeVersion = decodeURIComponent(array?.[array?.length-1]);
	// 这边可以处理版本格式问题
	if(githubNodeVersion.substring(0,1).toLowerCase()==="v"){
		githubNodeVersion = githubNodeVersion.substring(1);
	}
	await axios.post(
		`http://127.0.0.1:${port}/api/update/feed`,
		{feedUrl: feed_url, updateFeed, githubNodeVersion},
	);
};

async function main() {

    const res = await axios.get(
		`http://127.0.0.1:${port}/api/list/subscriptions`
	);
	const subscriptions: any = res.data.data;
	console.log(subscriptions.length);

	// 每次循环（总数/4）个
	const currentMinute = new Date().getMinutes();
	const currentCohort = Math.floor(currentMinute/15); // 0, 1, 2, 3
	const totalNum = subscriptions.length;
	const cohortSize = Math.floor(totalNum / 4);
	const loopStart = currentCohort * cohortSize;
	const loopEnd = currentCohort === 3 ? totalNum : (currentCohort + 1) * cohortSize;
	// console.log(loopStart, loopEnd)
	for (let i = loopStart; i < loopEnd; i++) {
		const {
			feed_url,
			lark_url,
			current_feed,
			reminded,
			reminder_date,
			node_name,
			node_full_name,
			reminder_text,
			handler
		} = subscriptions[i];

		// 检查reminder_date和reminded. 如果当前时间已经大于等于设定时间，那么发送lark消息.
		if(reminded===0 && (new Date().getTime())>=reminder_date){
			const reminderLarkMsg = generateLarkNotice(
				`${node_full_name} 提醒`,
				[
					`提醒日期：${new Date(reminder_date).toLocaleString()}`,
					"",
					`提醒文字：${reminder_text}`
				]
			);
			await axios.post(lark_url, reminderLarkMsg);

			const reminderLarkMsgV2 = generateLarkNotice(
				`${node_full_name} 提醒`,
				[
					`提醒日期：${new Date(reminder_date).toLocaleString()}`,
					"",
					`提醒文字：${reminder_text}`,
					""
				],
				[
					{
						"tag": "at",
						"user_id": handlerToLarkId[handler].user_id,
						"user_name": handlerToLarkId[handler].user_name
					}
				]
			);
			await axios.post(LARK_HARDFORK_URL, reminderLarkMsgV2);

			// 重置reminded和reminder_date
			await axios.post(
				`http://127.0.0.1:${port}/api/set/reminder-date`,
				{reminderDate: null, nodeName: node_name, reminded: 1}
			)
		}

		// 根据列表，http请求获取最新feeds
		const fetchedFeeds: any = await requests.getRssFeed(feed_url);
		// console.log(fetchedFeeds);

		// 如果数据库中的current_feed字段不存在，说明是新的subscription，只更新current_feed即可
		if(!current_feed){
			// TODO: serialize otherwise when mass, some items missing. maybe batch send
			await updateCurrentFeed(feed_url, fetchedFeeds?.items?.[0]);
		}else{
			// 将获取的数据与数据库中的current_feed进行比较，记录不同的feeds. 最多比较3条数据。
			const updatedFeeds: any[] = [];
			const currentFeedId = JSON.parse(current_feed)?.id;
			for(let j=0; j<3; j++){
				const item = fetchedFeeds?.items?.[j];
				if(currentFeedId!==item?.id){
					console.log("currentFeedId: "+currentFeedId);
					updatedFeeds.push(item);
				}else{
					break;
				}
			}
			// console.log(updatedFeeds);

			// 如果有新的feeds
			if(updatedFeeds.length>0 && updatedFeeds[0]){
				// 发送新的数据到相应的lark channel
				for(let k=updatedFeeds.length-1; k>=0; k--){
					const response = await axios.post(
						lark_url,
						{
							"msg_type": "post",
							"content": {
								"post": {
									"zh_cn": {
										"title": fetchedFeeds.title,
										"content": [
											[
												{
													"tag": "a",
													"text": updatedFeeds[k].title,
													"href": updatedFeeds[k].link,
												},
											],
											[
												{
													"tag": "text",
													"text": new Date(updatedFeeds[k].pubDate).toLocaleString(),
												},
											],
											[
												{
													"tag": "text",
													"text": "",
												},
											],
											[
												{
													"tag": "a",
													"text": "ITSM",
													"href": "https://itsm-yi.go.akamai-access.com/#/index",
												},
											],
											[
												{
													"tag": "a",
													"text": "Monitor Dashboard",
													"href": "https://soul-version.go.akamai-access.com/",
												},
											],
											[
												{
													"tag": "text",
													"text": "",
												},
											],
											[
												{
													"tag": "text",
													"text": updatedFeeds[k].contentSnippet
												}
											]
										]
									}
								}
							}
						}
					);
					console.log(response.data)
				}

				await updateCurrentFeed(feed_url, updatedFeeds[0]);
			}
		}
	}
};
