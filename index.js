const aws = require("aws-sdk");
const ses = new aws.SES();
const dynamodb = new aws.DynamoDB.DocumentClient();
aws.config.update({ region: "us-east-1" });

exports.handler = (event, context, callback) => {
    let message = event.Records[0].Sns.Message
    message = JSON.parse(message)
    let searchParams = {
        TableName: "csye6225",
        Key: {
        id:message.email
        }
    };

    dynamodb.get(searchParams, (err, resp) => {
        console.log("Entered GET DynamoDB")
        if(!err){
            let alive = false;
            if (resp.Item == null || resp.Item == undefined) {
                alive = false;
            } else {
                if (resp.Item.ttl > parseInt(Date.now()/1000)) {
                    alive = true;
                }
            }
            if(!alive){
                let ttl = (5 * 60) + parseInt(Date.now()/1000);
                let params = {
                    Item: {
                        id:message.email,
                        token: message.token,
                        ttl: ttl,
                        from: "noreply@prod.ashwinkumarrk.me",
                    },
                    TableName: "csye6225"
                };

            dynamodb.put(params, (err, data) => {
                console.log("Entered PUT DynamoDB")
                if(!err){
                    let params = {
                        Destination: {
                            ToAddresses: [message.email],
                        },
                        Message: {
                            Body: {
                                Text: { Data: "Click the link to verify email for account creation\n\n" + 
                                "https://prod.ashwinkumarrk.me/v1/users/verifyUserEmail?email="+ message.email +"&token=" + message.token + "\n\n" +
                                "You will not be able to access anything unless you verify. Thank you."},
                            },
                            Subject: { Data: "Verify Email for Account Creation" },
                        },
                        Source: "noreply@prod.ashwinkumarrk.me",
                    };
                    return ses.sendEmail(params).promise()
                } else {
                    console.log(err);
                }
            })
            }
        } else {
            console.log("GET Request Failed / Data not Found", err);
        }
    })
}
