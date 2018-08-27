'use strict';

//PAGE_ACCESS_TOKEN = process 中環境變數 PAGE_ACCESS_TOKEN
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
//如果 port=1337 或是 =process 環境變數 PORT 則監聽，且在 log 中印出 webhook is listening
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

	// Parse the request body from the POST
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') 
	{

		body.entry.forEach(function(entry) 
		{

			// Gets the body of the webhook event
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);


			// Get the sender PSID
			let sender_psid = webhook_event.sender.id;
			console.log('Sender ID: ' + sender_psid);
			
			// Check if the event is a message or postback and
			// pass the event to the appropriate handler function
			if (webhook_event.message) 
			{
				handleMessage(sender_psid, webhook_event.message);   
			} 
			else if (webhook_event.postback) 
			{
				handlePostback(sender_psid, webhook_event.postback);
			}
      
		});
		// Return a '200 OK' response to all events
		res.status(200).send('EVENT_RECEIVED');

	} 
	else 
	{
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
	/** UPDATE YOUR VERIFY TOKEN **/
	const VERIFY_TOKEN = process.env.MESSAGER_VALIDATION_TOKEN;
  
	// Parse params from the webhook verification request
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
		
	// Check if a token and mode were sent
	if (mode && token) 
	{
		// Check the mode and token sent are correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) 
		{
			// Respond with 200 OK and challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} 
		else
		{
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);      
		}
	}
});

/*
//使用handlePostback針對message回傳做動作
function handleMessage(sender_psid, received_message) 
{
	let response;
  
	// Checks if the message contains text
	if (received_message.text && received_message.text!='question') 
	{    
		// Create the payload for a basic text message, which
		// will be added to the body of our request to the Send API
		response = 
		{
			"text": `You sent the message: "${received_message.text}". Now send me an attachment!`
		}
	} 
	else if (received_message.text=='question')
	{
		response = 
		{
			"attachment": 
			{
				"type": "template",
				"payload": 
				{
					
					"template_type": "button",
					"text":"What is your question?",
					"buttons":[
					{
						"type":"postback",
						"title":"1. question 1",
						"payload":"1",
					},
					{
						"type":"postback",
						"title":"2. question 2",
						"payload":"2",
					},
					{
						"type":"postback",
						"title":"3. question 3",
						"payload":"3",
					}
					]
				}
			}
		}
	}
  
	// Send the response message
	callSendAPI(sender_psid, response);    
}	
*/
//使用handlePostback針對postback按鈕回傳做動作
function handlePostback(sender_psid, received_postback) 
{
	console.log('ok')
	let response;
	// Get the payload for the postback
	let payload = received_postback.payload;

	// Set the response based on the postback payload
	if (payload === '1') 
	{
		response = { "text": "you choose question 1 ." }
	}
	else if (payload === '2') 
	{
		response = { "text": "you choose question 2 ." }
	}
	else if (payload === '3') 
	{
		response = { "text": "you choose question 3 ." }
	}
	else if (payload === 'get_start' )
	{
		response = { "text": "Thank you for use. If you have question, please input question"}
	}
	// Send the message to acknowledge the postback
	callSendAPI(sender_psid, response);
}

//呼叫callSendAPI幫忙傳送訊息
function callSendAPI(sender_psid, response) 
{
	// Construct the message body
	let request_body = 
	{
		"recipient": 
		{
			"id": sender_psid
		},
		"message": response
	}

	// Send the HTTP request to the Messenger Platform
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

function firstEntity(nlp, name) 
{
	return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

function handleMessage(sender_psid, received_message)  
{
	// check greeting is here and is confident
	let response;
	const greeting = firstEntity(received_message.nlp, 'greetings');
	if (greeting && greeting.confidence > 0.8) 
	{
		response = 
			{
				"text": "Hi there!"
			}
	}
	else 
	{ 
		// Checks if the message contains text
		if (received_message.text && received_message.text!='question') 
		{    
			// Create the payload for a basic text message, which
			// will be added to the body of our request to the Send API
			response = 
			{
				"text": `You sent the message: "${received_message.text}". Now send me an attachment!`
			}
		} 
		else if (received_message.text=='question')
		{
			response = 
			{
				"attachment": 
				{
					"type": "template",
					"payload": 
					{
						
						"template_type": "button",
						"text":"What is your question?",
						"buttons":[
						{
							"type":"postback",
							"title":"1. question 1",
							"payload":"1",
						},
						{
							"type":"postback",
							"title":"2. question 2",
							"payload":"2",
						},
						{
							"type":"postback",
							"title":"3. question 3",
							"payload":"3",
						}
						]
					}
				}
			}
		}
	}
	
	
	// Send the response message
	callSendAPI(sender_psid, response);    
}
