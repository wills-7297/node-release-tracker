import * as db from "./services/db";
import express from "express";
import cors from "cors";

// TODO: auth中间件
// TODO: 竞品的公告网站
const app = express();
const port = process.env.PORT || 8000;

const corsOptions = {
	origin: 'http://localhost:3000',
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

require("./routes")(app);

db.init().then(() => {
	app.listen(port, () => {
		console.log("Started Server...");
		console.log(`Listening on http://127.0.0.1:${port}`);
	});
}).catch((e: Error) => {
	console.log(e);
});

