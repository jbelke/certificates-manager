# Certificates Manager

> Manage certificates in ABT Node.

**WORK IN PROGRESS**

## Getting started

### Configuration

Put following contents in `.env`:

```ini
SKIP_PREFLIGHT_CHECK=true

# server side
BLOCKLET_PORT="3030"

REACT_APP_BASE_URL="http://192.168.31.60:3030"
REACT_APP_APP_NAME="Certificate Manager"
REACT_APP_APP_DESCRIPTION="Manage SSL certificates"
REACT_APP_API_PREFIX=""

ALI_ACCESS_KEY_ID='xxx'
ALI_ACCESS_KEY_SECRET='xxx'
NODE_ACCESS_KEY='xxx'
NODE_ACCESS_SECRET='xxx'
ABT_NODE_PORT=8089
```

### Start hacking

```shell
npm run start:server
npm run start:client
```

### Deploy to local ABT Node

```shell
abtnode deploy .
```

## TODO

### feature

- [ ] renewal
- [ ] logger
- [ ] better http-01 memory plugin, base on `acme-http-01-standalone` plugin

### UI

- [ ] DNS(CNAME) configuration checking
- [ ] Domain List