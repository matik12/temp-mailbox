const crypto = require('crypto');
const request = require('request-promise-native');
const { JSDOM } = require("jsdom");
const cloudscraper = require('cloudscraper');

/**
 * @type {string}
 * @const
 */
const API_URL = 'https://privatix-temp-mail-v1.p.mashape.com';

/**
 * @type {string}
 * @const
 */
const CHANGE_EMAIL_URL = 'https://temp-mail.org/en/option/change/'

/**
 * Formats email message
 */
function formatMessage(message) {
  return {
    id: message.mail_id,
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
   * @param {string} [key] Mashape-Key
   * @param {string|null} [address]
   * @param {string} [apiUrl]
   */
  constructor(key, address = null, apiUrl = API_URL) {
    this.key = key;
    this.address = address;
    this.addressHash = address ? this.createAddressHash(address) : null;
    this.apiUrl = apiUrl;
    this.messages = [];
  }

  /**
   *  Make a http request
   *  @returns {Promise.<any>}
   */
  makeRequest(uri) {
    return request({
      uri,
      json: true,
      headers: {
        'X-Mashape-Key': this.key,
        'Accept': 'application/json'
      }
    });
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
    return new Promise((resolve, reject) => {
      cloudscraper.get(CHANGE_EMAIL_URL, function(error, response, body) {
        if (error) {
          reject(error);
        } else {
          console.log(body)
          const pageDom = new JSDOM(body);
          const pageDocument = pageDom.window.document;

          const domains = Array.from(pageDocument.querySelectorAll('#domain option'))
            .map(option => option.value)

          resolve(domains);
        }
      });
    });
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

    let url = `${this.apiUrl}/request/mail/id/${this.createAddressHash(address)}/`;

    return this.makeRequest(url)
      .then(response => {
        this.messages = Array.isArray(response) ? response.map(formatMessage) : [];

        return this.messages;
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

    return this.makeRequest(`${this.apiUrl}/request/delete/id/${messageId}/`);
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

exports["default"] = MailBox;
