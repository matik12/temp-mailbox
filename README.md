# temp-mailbox
Node.js wrapper for [http://temp-mail.ru/en/api/](http://temp-mail.ru/en/api/)

# Installation
- ```npm i disposable-mail --save-dev```

# Usage
- Require it where needed

	```js
	let MailBox = require('disposable-mail');
	```

- Create new instance of MailBox
    ```js
    // If no `emailAddress` is provided, it generates one
    let mailBox = new MailBox();
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
Licensed under the MIT license.

Original work Copyright (c) 2016 EV-Box

Modified work Copyright 2017 Craig de Gouveia
