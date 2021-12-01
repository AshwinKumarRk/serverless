# serverless

The repository consists of a Lambda function. It is responsible for accessing two services,

1. SES - Triggered to send a verification email containing a link which the user must click on to verify their profile
2. DynamoDB - Data regarding the verification link (record) is stored in DynamoDB

This Lambda function is triggered by SNS as Lambda picks up a published message and acts accordingly