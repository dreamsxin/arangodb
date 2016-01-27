'use strict';
////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2016 ArangoDB GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Alan Plum
////////////////////////////////////////////////////////////////////////////////

const parseUrl = require('url').parse;
const formatUrl = require('url').format;
const typeIs = require('type-is').is;
const accepts = require('accepts');
const parseRange = require('range-parser');
const querystring = require('querystring');
const getRawBodyBuffer = require('internal').rawRequestBody;
const crypto = require('@arangodb/crypto');


module.exports = class SyntheticRequest {
  constructor(req, context) {
    this._url = parseUrl(req.url);
    this._raw = req;
    this.context = context;
    this.path = req.path;
    this.suffix = req.suffix;
    this.queryParams = querystring.decode(this._url.query);
    this.pathParams = {};
    this.body = getRawBodyBuffer(req);
    this.baseUrl = `/_db/${encodeURIComponent(this._raw.database)}${context.mount}`;

    const server = extractServer(req, context.trustProxy);
    this.protocol = server.protocol;
    this.hostname = server.hostname;
    this.port = server.port;

    const client = extractClient(req, context.trustProxy);
    this.remoteAddress = client.ip;
    this.remoteAddresses = client.ips;
    this.remotePort = client.port;
  }

  // Node compat

  get headers() {
    return this._raw.headers;
  }

  get method() {
    return this._raw.requestType;
  }

  // Express compat

  get originalUrl() {
    return `/_db/${encodeURIComponent(this._raw.database)}${this._raw.url}`;
  }

  get secure() {
    return this.protocol === 'https';
  }

  get url() {
    return formatUrl({
      query: querystring.encode(this.queryParams),
      pathname: this.path
    });
  }

  get xhr() {
    const header = this.headers['x-requested-with'];
    return Boolean(header && header.toLowerCase() === 'xmlhttprequest');
  }

  accepts(types) {
    const accept = accepts(this);
    return accept.type(types);
  }

  acceptsCharsets() {
    const accept = accepts(this);
    return accept.charset.apply(accept, arguments);
  }

  acceptsEncodings() {
    const accept = accepts(this);
    return accept.encoding.apply(accept, arguments);
  }

  acceptsLanguages() {
    const accept = accepts(this);
    return accept.language.apply(accept, arguments);
  }

  get(name) {
    name = name.toLowerCase();
    if (name === 'referer' || name === 'referrer') {
      return this.headers.referer || this.headers.referrer;
    }
    return this.headers[name];
  }

  is(mediaType) {
    if (!this.headers['content-type']) {
      return false;
    }
    return Boolean(typeIs(this.headers['content-type'], mediaType));
  }

  // idiosyncratic

  cookie(name, opts) {
    if (typeof opts === 'string') {
      opts = {secret: opts};
    } else if (!opts) {
      opts = {};
    }
    const value = this._raw.cookies[name];
    if (value && opts.secret) {
      const signature = this._raw.cookies[`${name}.sig`];
      const valid = crypto.constantEquals(
        signature || '',
        crypto.hmac(opts.secret, value, opts.algorithm)
      );
      if (!valid) {
        return undefined;
      }
    }
    return value;
  }

  makeAbsolute(path) {
    return this.protocol + '://' + this.hostname + (
      (this.secure ? this.port !== 443 : this.port !== 80)
      ? ':' + this.port : ''
    ) + this.baseUrl + path;
  }

  ranges(size) {
    if (!this.headers.range) {
      return [];
    }
    return parseRange(size, this.headers.range);
  }
};


function extractServer(req, trustProxy) {
  let hostname = req.server.address;
  let port = req.server.port;
  const protocol = (
    (trustProxy && req.headers['x-forwarded-proto'])
    || req.protocol
  );
  const hostHeader = (
    (trustProxy && req.headers['x-forwarded-host'])
    || req.headers.host
  );
  if (hostHeader) {
    const match = hostHeader.match(/^(.*):(\d+)$/) || [hostHeader, hostHeader];
    if (match) {
      hostname = match[1];
      port = match[2] ? Number(match[2]) : 80;
    }
  }
  return {
    protocol: protocol,
    hostname: hostname,
    port: port
  };
}


function extractClient(req, trustProxy) {
  let ip = req.client.address;
  let ips = [ip];
  let port = req.client.port;
  const forwardedFor = req.headers['x-forwarded-for'];
  if (trustProxy && forwardedFor) {
    const tokens = forwardedFor.split(/\s*,\s*/g).filter(Boolean);
    if (tokens.length) {
      ips = tokens;
      ip = tokens[0];
    }
  }
  const match = ip.match(/^(.*)(:\d+)?$/);
  if (match) {
    ip = match[1];
    port = match[2] || port;
  }
  return {
    ips: ips,
    ip: ip,
    port: port
  };
}
