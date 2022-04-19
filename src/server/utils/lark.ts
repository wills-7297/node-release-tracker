export const LARK_ADMIN_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/816f1422-032f-497e-b463-7fefcdff1390";
export const LARK_HARDFORK_URL = "https://open.larksuite.com/open-apis/bot/v2/hook/f5618404-b082-4e1c-b48c-6c3d44294b97";

export const handlerToLarkId = {
    "flanker": {user_id: "2b6e7bg3", user_name: "flanker.zhang"},
    "jason": {user_id: "g9536352", user_name: "ty.tang"},
    "stone": {user_id: "ffce3a5c", user_name: "stone.shi"},
    "shijiang": {user_id: "e141e3a3", user_name: "Shijiang Guo"},
    "will": {user_id: "86d4778e", user_name: "will.shu"},
}

export const generateLarkNotice = (title, array, appendix?) => {
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
    if(appendix){
        content.push(appendix);
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