export const CORRESPONDENT_LARK_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/816f1422-032f-497e-b463-7fefcdff1390";

export const generateLarkNotice = (title, array) => {
    let content: any[] = [];
    for(let i = 0; i<array.length; i++){
        content.push(
            [
                {
                    "tag": "text",
                    "text": array[i]
                }
            ]
        );
    }
	return {
		"msg_type": "post",
		"content": {
			"post": {
				"zh_cn": {
					"title": title,
					"content": content,
				}
			}
		}
	}
};