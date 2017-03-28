# disposable-mail
Node.js wrapper for [https://temp-mail.org/en/api/](https://temp-mail.org/en/api/)

# Installation
- ```npm i disposable-mail --save-dev```

# Usage
- Require it where needed

	```js
	let MailBox = require('disposable-mail');
	```

- Create new instance of MailBox
    ```js
    // Credentials is a base64 encoded `username:password` combination. You can optionally provide `emailAddress` and `apiUrl` parameters
    // If no `emailAddress` is provided, it generates one
    let credentials = Buffer.from('testuser:password123').toString('base64');
    let mailBox = new MailBox(credentials);
    ```

- Get available domains

	```js
	mailBox.getAvailableDomains().then(domains => console.log(domains));
	```

- Generate random email address on one of the available domains

	```js
	// Provide optional `len` parameter to limit the length of email address
	//  If no `len` param is provided, 7 is used by default
	mailBox.getEmailAddress().then(emailAddress => console.log(emailAddress));

	// Email address and email address md5 hash are also available on the instance
	console.log(mailBox.address);
	console.log(mailBox.addressHash);
	```

- Retrieve all mesages from inbox of the generated email address

	```js
	mailBox.getMessages().then(messages => console.log(messages));

	// Mesages are also available on the instance
	console.log(mailBox.messages);
	```

- Delete a message from inbox

	```js
	mailBox.deleteMessage(messageId).then(deletedMessage => console.log(deletedMessage));
	```

- Delete all messages from inbox

	```js
	mailBox.deleteAllMessages().then(response => console.log(response));
	```

# License
Licensed under the MIT license. Copyright (c) 2016-2017 EV-Box
