import * as db from "./services/db";
import express from "express";
import cors from "cors";
import next from "next";

// TODO: auth中间件
// TODO: 竞品的公告网站
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();
	server.use(cors());
	require("./routes")(server);

	server.all('*', (req, res) => {
		return handle(req, res)
	});

	db.init().then(() => {
		server.listen(port, () => {
			console.log("Started Server...");
			console.log(`Listening on http://127.0.0.1:${port}`);
		});
	}).catch((e) => {
		console.log(e);
	});
});
