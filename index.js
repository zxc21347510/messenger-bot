'use strict';

//PAGE_ACCESS_TOKEN = process 中環境變數 PAGE_ACCESS_TOKEN
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Imports 相關 dependencies 並且設定 http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // 建立express http server

//如果 port=1337 或是 =process 環境變數 PORT 則監聽，且在 log 中印出 webhook is listening
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

//在/webhook端點接收POST要求
app.post('/webhook', (req, res) => {  

	// 解析來自POST的request body
	let body = req.body;

	// 確認webhook事件是來自於Page subscription
	if (body.object === 'page') 
	{

		body.entry.forEach(function(entry) 
		{

			//獲得webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);


			//獲得sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender ID: ' + sender_psid);
			
			//如果事件是來自於messenger，則呼叫handleMessage function進行後續動作
			if (webhook_event.message) 
			{
				handleMessage(sender_psid, webhook_event.message);   
			} 
			//如果事件是來自於postback，則呼叫handlePostback function進行後續動作
			else if (webhook_event.postback) 
			{
				handlePostback(sender_psid, webhook_event.postback);
			}
      
		});
		// 回覆 200 OK
		res.status(200).send('EVENT_RECEIVED');

	} 
	else 
	{
		// 如果不是來自page的事件，回復404 Not Found
		res.sendStatus(404);
	}

});

// 在/webhook端點接收GET要求
app.get('/webhook', (req, res) => {
  
	//VERIFY_TOKEN=自己process的訂閱權杖
	const VERIFY_TOKEN = process.env.MESSAGER_VALIDATION_TOKEN;
  
	// 解析來自於webhook的驗證請求中的變數
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
		
	// 如果有token以及mode送來
	if (mode && token) 
	{
		// 確認送來的mode以及token是正確的
		if (mode === 'subscribe' && token === VERIFY_TOKEN) 
		{
			// 如果驗證通過，傳送 200 OK 
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} 
		else
		{
			// 如果驗證權杖不符合，則傳送 403 Forbidden 
			res.sendStatus(403);      
		}
	}
});

//使用handlePostback針對message回傳做動作
function handleMessage(sender_psid, received_message)  
{
	var check=-1;
	let choose;
	let response;
	
	//如果回傳的nlp中的support==true && confidence>0.8 --> 呼叫checkWhich設定respose
	let greeting = firstEntity(received_message.nlp, 'support');
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="support";
		//console.log('choose:'+choose);
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的hello==true && confidence>0.8 --> 設定respose
	greeting = firstEntity(received_message.nlp, 'hello')
	if (greeting && greeting.confidence > 0.8) 
	{
		response = 
		{
			"text": "Hello~"
		}
		check=1;
	}
	
	//如果回傳的nlp中的byes==true && confidence>0.8 --> 設定respose
	greeting = firstEntity(received_message.nlp, 'byes')
	if (greeting && greeting.confidence > 0.8) 
	{
		response = 
		{
			"text": "Bye~~"
		}
		check=1;
	}
	
	//如果回傳的nlp中的thank==true && confidence>0.8 --> 設定respose
	greeting = firstEntity(received_message.nlp, 'thank')
	if (greeting && greeting.confidence > 0.8) 
	{
		response = 
		{
			"text": "感謝您的使用~"
		}
		check=1;
	}
	
	//如果回傳的nlp中的controller==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'controller')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="controller";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的AGfunfeature==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'AGfunfeature')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="AGfunfeature";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的AGfuncontroller==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'AGfuncontroller')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="AGfuncontroller";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的product==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'product')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="product";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的menu==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'menu')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="menu";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的start==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'start')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="start";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果回傳的nlp中的instructions==true && confidence>0.8 --> 呼叫checkWhich設定respose
	greeting = firstEntity(received_message.nlp, 'instructions')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="instructions";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	greeting = firstEntity(received_message.nlp, 'picture')
	if (greeting && greeting.confidence > 0.8) 
	{
		choose="picture";
		checkWhich(sender_psid,choose);
		check=1;
	}
	
	//如果使用者輸入的訊息無法識別 --> 設定respose
	if(check===-1)
	{
		response = 
		{
			"text": "Sorry~ I can't answer you. Please input other word."
		}
	}
	
	//送出response訊息
	callSendAPI(sender_psid, response); 
}

//使用handlePostback針對postback按鈕回傳做動作
function handlePostback(sender_psid, received_postback) 
{
	console.log('ok')
	let response;
	
	//獲得 postback的payload數值
	let payload = received_postback.payload;

	//設定 postback 不同 parload 的回應
	if (payload === 'product')
	{
		checkWhich(sender_psid,'product'); 
	}
	else if (payload === 'support') 
	{
		checkWhich(sender_psid,'support'); 
	}
	//如果按下的為"開始使用"的按鈕
	else if (payload === 'get_start' )
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"感謝您的使用，請問是否需要以下的協助呢?\n如果不需要，請您輸入其他關鍵字",
					"buttons":
					[
						{
							"type":"postback",
							"title":"產品",
							"payload":"product",
						},
						{
							"type":"postback",
							"title":"支援服務",
							"payload":"support",
						},
						{
							"type":"phone_number",
							"title":"聯絡我們",
							"payload":process.env.phone_number	//phone_number為環境變數，儲存按下按鈕後撥打的電話號碼
						}
					]
				}
			}	
		}
	}
	else if (payload === 'AGmini') 
	{
		checkWhich(sender_psid,'AGmini'); 
	}
	else if (payload === 'AGfun Box') 
	{
		checkWhich(sender_psid,'AGfun Box'); 
	}
	else if (payload === 'Remote') 
	{
		checkWhich(sender_psid,'Remote'); 
	}
	
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
}

//設定使用者問題的response
function checkWhich(sender_psid,choose)
{
	let response;
	
	//如果關鍵字為詢問產品的支援服務
	if(choose==='support')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於產品的支援服務",
					"buttons":
					[
						{
							"type":"web_url",
							"url":"http://agfun.tv/agmini_support.html",
							"title":"AGmini",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"http://agfun.tv/support.html",
							"title":"AGfun Box",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"http://agfun.tv/remote_support.html",
							"title":"Remote",
							"webview_height_ratio": "full"
						}
					]
				}
			}	
		}
	}
	//如果為詢問遙控器的問題
	else if(choose==='controller')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於遙控器的問題",
					"buttons":
					[
						{
							"type":"web_url",
							"url":"https://www.youtube.com/watch?v=CCBpTiCFpRA",
							"title":"AGfun專利遙控器有多好用？",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"https://www.youtube.com/watch?time_continue=3&v=kp7m4_aAABk",
							"title":"AGfun遙控器紅外線學習",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"https://www.youtube.com/watch?v=-OQIiJXGUqc",
							"title":"AGfun遙控器-手機版教學",
							"webview_height_ratio": "full"
						}
					]
				}
			}	
		}
	}
	//如果為詢問AGfun特色的問題-->傳送影片可為youtube的影片，但url需要經過處理
	else if(choose==='AGfunfeature')
	{
		response = 
		{
			"attachment": 
			{
				"type": "video",
				"payload": 
				{	
					"is_reusable": true,
					"url": "https://redirector.googlevideo.com/videoplayback?initcwndbps=256250&expire=1534507939&ei=Q2d2W_HHGMTdxgK1or_YAg&key=yt6&sparams=clen%2Cdur%2Cei%2Cgir%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cusequic%2Cexpire&c=WEB&mn=sn-25glenez%2Csn-h5q7dnld&mm=31%2C26&ip=195.154.200.89&ms=au%2Conr&requiressl=yes&pl=21&itag=18&mt=1534486198&dur=58.909&id=o-AB7yOW985ai8Qzm5J3BuONeFpCdzge8MYYD9JySMagEK&mime=video%2Fmp4&mv=m&ipbits=0&usequic=no&gir=yes&lmt=1462868525959698&signature=B0DA1936E21E29C7C015004B4D811A1CB5131ED2.784A351FF720D1BCFB06372D43D9F3E98614A5BC&source=youtube&ratebypass=yes&fvip=6&clen=3938385&title=AGfun%E4%B8%80%E5%88%86%E9%90%98%E7%89%B9%E8%89%B2%E4%BB%8B%E7%B4%B9"
				}
			} 
		}
	}
	//如果為詢問AGFUN專利遙控器的問題-->傳送影片只可為facebook上的影片，但url可直接使用
	else if(choose==='AGfuncontroller')
	{
		response = 
		{
			"attachment": 
			{
				"type": "template",
				"payload": 
				{
					"template_type": "media",
					"elements": 
					[
						{
							"media_type": "video",
							"url": "https://www.facebook.com/agfuntv/videos/197054430628086/",
							"buttons": 
							[
								{
									"type": "web_url",
									"url": "http://agfun.tv/agfunbox.html",
									"title":"前往網站查看"
								}
							]
						}
					]
				}
			} 
		}
	}
	//如果為詢問AGmini照片的問題
	else if(choose==='AGmini')
	{
		response = 
		{
			"attachment":
			{
				"type":"image", 
				"payload":
				{
					"url":"http://agfun.tv/asset/list_agmini.png", 
					"is_reusable":true
				}
			}
		}
	}
	//如果為詢問AGfun Box照片的問題
	else if(choose==='AGfun Box')
	{
		response = 
		{
			"attachment":
			{
				"type":"image", 
				"payload":
				{
					"url":"http://agfun.tv/asset/list_box.png", 
					"is_reusable":true
				}
			}
		}
	}
	//如果為詢問Remote照片的問題
	else if(choose==='Remote')
	{
		response = 
		{
			"attachment":
			{
				"type":"image", 
				"payload":
				{
					"url":"http://agfun.tv/asset/list_remo.png", 
					"is_reusable":true
				}
			}
		}
	}
	//如果為詢問產品的問題
	else if(choose==='product')
	{
		response = 
		{
			//產品以輪播的方式介紹->含圖片、URL連結
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"generic",
					"elements":
					[
						{
							"title":"AGmini",
							"image_url":"http://agfun.tv/asset/list_agmini.png",
							"subtitle":"輕巧便攜，搭配電視、微投影最方便",
							"buttons":
							[
								{
									"type":"web_url",
									"url":"http://agfun.tv/agmini.html",
									"title":"前往網站查看"
								}        
							]      
						},
						{
							"title":"AGfun Box",
							"image_url":"http://agfun.tv/asset/list_box.png",
							"subtitle":"神奇遙控，獨家AGfun系統經典款",
							"buttons":
							[
								{
									"type":"web_url",
									"url":"http://agfun.tv/agfunbox.html",
									"title":"前往網站查看"
								}        
							]      
						},
						{
							"title":"AGremo",
							"image_url":"http://agfun.tv/asset/list_remo.png",
							"subtitle":"六軸體感操作 X 紅外線周邊遙控",
							"buttons":
							[
								{
									"type":"web_url",
									"url":"http://agfun.tv/agremote.html",
									"title":"前往網站查看"
								}        
							]      
						}
					]
				}
			}
		}
	}
	//如果為需要開啟菜單的狀況
	else if(choose==='menu')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於您的問題",
					"buttons":
					[
						{
							"type":"postback",
							"title":"產品",
							"payload":"product",
						},
						{
							"type":"postback",
							"title":"支援服務",
							"payload":"support",
						},
						{
							"type":"phone_number",
							"title":"聯絡我們",
							"payload":process.env.phone_number //phone_number為環境變數，儲存按下按鈕後撥打的電話號碼
						}
					]
				}
			}	
		}
	}
	//如果為詢問第一次使用教學
	else if(choose==='start')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於第一次使用的設定",
					"buttons":
					[
						{
							"type":"web_url",
							"url":"http://agfun.tv/agmini_support.html?onload=product&type=remote",
							"title":"AGmini",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"https://www.youtube.com/watch?v=vPxUIDIhSuI",
							"title":"AGfun Box",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"http://agfun.tv/remote_support.html?onload=product&type=remote",
							"title":"Remote",
							"webview_height_ratio": "full"
						}
					]
				}
			}	
		}
	}
	//如果為詢問產品說明書的問題
	else if(choose==='instructions')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於產品的說明書",
					"buttons":
					[
						{
							"type":"web_url",
							"url":"http://agfun.tv/manual/AGmini_manual.pdf",
							"title":"AGmini",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"http://agfun.tv/manual/AGfunbox_manual.pdf",
							"title":"AGfun Box",
							"webview_height_ratio": "full"
						},
						{
							"type":"web_url",
							"url":"http://agfun.tv/manual/AGRemote_manual.pdf",
							"title":"Remote",
							"webview_height_ratio": "full"
						}
					]
				}
			}	
		}
	}
	//如果為詢問產品照片的問題
	else if (choose==='picture')
	{
		response = 
		{
			"attachment":
			{
				"type":"template",
				"payload":
				{
					"template_type":"button",
					"text":"關於產品的照片",
					"buttons":
					[
						{
							"type":"postback",
							"title":"AGmini",
							"payload":"AGmini",
						},
						{
							"type":"postback",
							"title":"AGfun Box",
							"payload":"AGfun Box",
						},
						{
							"type":"postback",
							"title":"Remote",
							"payload":"Remote"
						}
					]
				}
			}	
		}
	}
	
	callSendAPI(sender_psid, response); 
}

//呼叫callSendAPI幫忙傳送訊息
function callSendAPI(sender_psid, response) 
{
	//建構message的架構
	let request_body = 
	{
		"recipient": 
		{
			"id": sender_psid
		},
		"message": response
	}

	//送出HTTP request給messenger platform
	request(
	{
		"uri": "https://graph.facebook.com/v2.6/me/messages",
		"qs": { "access_token": PAGE_ACCESS_TOKEN },
		"method": "POST",
		"json": request_body
	}, (err, res, body) => {
    if (!err) 
	{
		console.log('message sent!')
    } 
	else 
	{
		console.error("Unable to send message:" + err);
    }
	}); 
}

//獲得nlp的回傳數值
function firstEntity(nlp, name) 
{
	return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}
