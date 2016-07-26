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
    constructor(apiUrl) {
        this.apiUrl = apiUrl || API_URL;
    }

    /**
     * Generates MD5 hash from email
     * @param {string} email
     * @returns {string}
     */
    getEmailHash(email) {
        return crypto.createHash('md5').update(email).digest('hex');
    }

    /**
     * Generates random email on one of the available domains
     * @param {Array} domains
     * @param {number} [len=7]
     * @returns {string}
     */
    getRandomEmail(domains, len = 7) {
        const name = Math.random().toString(36).substring(len);
        const domain = domains[Math.floor(Math.random() * domains.length)];

        return name + domain;
    }

    /**
     * Receives available domains
     * @returns {Promise.<Array, Error>}
     */
    getAvailableDomains() {
        return fetch(`${this.apiUrl}/request/domains/format/json/`).then(transformResponse);
    }

    /**
     * Generates email on temp-mail.ru
     * @param {number} [len]
     * @returns {Promise.<String, Error>}
     */
    generateEmail(len) {
        return getAvailableDomains()
                .then(availableDomains => getRandomEmail(availableDomains, len));
    }

    /**
     * Receives inbox from temp-mail.ru
     * @param {string} email
     * @returns {Promise.<(Object|Array), Error>}
     */
    getInbox(email) {
        if (!email) {
            throw new Error('Please specify email');
        }

        return fetch(`${this.apiUrl}/request/mail/id/${this.getEmailHash(email)}/format/json/`).then(transformResponse);
    }
}

module.exports = MailBox;
