const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * @type {string}
 * @const
 */
const API_URL = 'https://api.temp-mail.ru';

/**
 * Transforms response to JSON
 */
function transformResponse(response) {
    return response.json();
}

class MailBox {
    /**
     * @constructor
     */
    constructor(address, apiUrl) {
        this.address = address || null;
        this.addressHash = address ? this.createAddressHash(address) : null;
        this.apiUrl = apiUrl || API_URL;
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
        const name = Math.random().toString(36).substring(len);
        const domain = domains[Math.floor(Math.random() * domains.length)];

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

        return fetch(`${this.apiUrl}/request/mail/id/${this.createAddressHash(address)}/format/json/`).then(transformResponse);
    }

    /**
     * Deletes message with a given id
     * @param {string} messageId
     * @returns {Promise.<(Object|Array), Error>}
     */
    deleteMessage(messageId) {
        return fetch(`${this.apiUrl}/request/delete/id/${messageId}`).then(transformResponse);
    }
}

module.exports = MailBox;
