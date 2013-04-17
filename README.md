# Umpire

## Overview

Numpire (Umpire in node.js) provides a normalized HTTP endpoint that responds with 200 / non-200 according to the metric check parameters specified in the requested URL. This endpoint can then be composed with existing HTTP-URL-monitoring tools like [Pingdom](http://www.pingdom.com) to enable self-service QoS monitoring of metrics.


## Usage Examples

Set an `UMPIRE_URL` that you can use to query against:

```bash
$ export UMPIRE_URL=http://umpire.somedomain123.net
```
To respond with 200 if the `pulse.nginx-requests-per-second` metric has had an average value of less than 400 over the last 300 seconds:

```bash
$ curl -i "$UMPIRE_URL/check?metric=pulse.nginx-requests-per-second&max=400&range=300"
```

To respond with 200 if the `custom.api.production.requests.per-sec` metric has had an average value of more than 40 over the past 60 seconds:

```bash
$ curl -i "$UMPIRE_URL/check?metric=custom.api.production.requests.per-sec&min=40&range=60"
```

Installing Numpire
-----------------

Numpire requires Node.js 0.8

To install from GitHub, clone the repository and install dependencies using `npm`:

    > git clone git://github.com/m4tty/numpire.git
    > cd numpire
    > npm install

Modify config.json appropriately

Lastly, start the application with:

    > node index.js


## Health

Check the health of the Umpire process itself with:

```bash
$ curl -i "$UMPIRE_URL/health"
```




License
===
The MIT License (MIT) Copyright (c) 2012 Matt Self

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.