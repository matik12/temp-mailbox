const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * @type {string}
 * @const
 */
const API_URL = 'http://api.temp-mail.ru';

/**
 * Transforms response to JSON
 */
function transformResponse(response) {
    return response.json();
}

/**
 * Formats email message
 */
function formatMessage(message) {
    return {
        id: message.mail_id,
        uid: message.mail_unique_id,
        from: message.mail_from,
        subject: message.mail_subject,
        preview: message.mail_preview,
        text: message.mail_preview.replace(/\s/g, ' ').trim(),
        textOnly: message.mail_text_only,
        html: message.mail_html,
        timestamp: new Date(parseInt(message.mail_timestamp + '000'))
    };
}

class MailBox {
    /**
     * @constructor
     * @param {string} credentials Base64 encoded `username:password` combination used for authentication to the API
     * @param {string|null} [address]
     * @param {string} [apiUrl]
     */
    constructor(credentials, address = null, apiUrl = API_URL) {
        // this.credentials = credentials;
        // this.params = {
        //     headers: {
        //         Authorization: 'Basic ' + this.credentials
        //     }
        // };
        this.address = address;
        this.addressHash = address ? this.createAddressHash(address) : null;
        this.apiUrl = apiUrl;
        this.messages = [];
    }

    /**
     *  Checks used requests count and limits for a given account
     *  @returns {Promise.<Object, Error>}
     */
    getAccountUsage() {
        return fetch(`${this.apiUrl}/request/account/format/json/`).then(transformResponse);
    }

    /**
     * Generates MD5 hash from email address
     * @param {string} address
     * @returns {string}
     */
    createAddressHash(address) {
        this.addressHash = crypto.createHash('md5').update(address).digest('hex');

        return this.addressHash;
    }

    /**
     * Generates random email address on one of the available domains
     * @param {Array} domains
     * @param {number} [len=7]
     * @returns {string}
     */
    generateRandomEmail(domains, len = 7) {
        let name = Math.random().toString(36).substring(len);
        let domain = domains[Math.floor(Math.random() * domains.length)];

        this.address = name + domain;

        return this.address;
    }

    /**
     * Receives available domains
     * @returns {Promise.<Array, Error>}
     */
    getAvailableDomains() {
        return fetch(`${this.apiUrl}/request/domains/format/json/`).then(transformResponse);
    }

    /**
     * Generates email address on temp-mail.ru
     * @param {number} [len]
     * @returns {Promise.<String, Error>}
     */
    getEmailAddress(len) {
        return this.getAvailableDomains()
            .then(availableDomains => this.generateRandomEmail(availableDomains, len));
    }

    /**
     * Receives all messages from inbox at temp-mail.ru
     * @param {string} [address]
     * @returns {Promise.<(Object|Array), Error>}
     */
    getMessages(address) {
        address = address || this.address;

        let url = `${this.apiUrl}/request/mail/id/${this.createAddressHash(address)}/format/json/`;

        return fetch(url).then(transformResponse)
            .then(response => {
                this.messages = Array.isArray(response) ? response.map(formatMessage) : [];

                return this.messages.length ? this.messages : response;
            });
    }

    /**
     * Deletes message with a given id
     * @param {string} messageId
     * @returns {Promise.<(Object|Array), Error>}
     */
    deleteMessage(messageId) {
        this.messages.forEach((message, index) => {
            this.messages.splice(index, 1);
        });

        return fetch(`${this.apiUrl}/request/delete/id/${messageId}/format/json`).then(transformResponse);
    }

    /**
     * Deletes all messages from inbox
     * @returns {Promise.<Object, Error>}
     */
    deleteAllMessages() {
        return Promise.all(this.messages.map(message => {
                return this.deleteMessage(message.id);
            }))
            .then(response => {
                this.messages.length = 0;

                return response;
            });
    }
}

module.exports = MailBox;